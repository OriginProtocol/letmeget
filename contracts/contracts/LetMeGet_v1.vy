# @version ^0.2.0

from vyper.interfaces import ERC721

event Offer:
    wanted_contract: indexed(address)
    wanted_token_id: indexed(uint256)
    offer_contract: indexed(address)
    offer_token_id: uint256

event Accept:
    wanted_contract: indexed(address)
    wanted_token_id: indexed(uint256)
    offer_contract: indexed(address)
    offer_token_id: uint256

VERSION: constant(uint256) = 1
PREFIX: constant(Bytes[28]) = b"\x19Ethereum Signed Message:\n32"
# Holds the address of the account that signed the offer
offers: HashMap[bytes32, address]


@internal
@pure
def _prefix_hash(hash: bytes32) -> Bytes[65]:
    return concat(PREFIX, hash)


@internal
@pure
def _recover(prefixed_hash: bytes32, signature: Bytes[65]) -> address:
    r: uint256 = convert(slice(signature, 0, 32), uint256)
    s: uint256 = convert(slice(signature, 32, 32), uint256)
    v: uint256 = convert(slice(signature, 64, 1), uint256)

    return ecrecover(prefixed_hash, v, r, s)

@internal
@pure
def _hash_params(
    offer_contract: address,
    offer_token_id: uint256,
    wanted_contract: address,
    wanted_token_id: uint256,
) -> bytes32:
    return keccak256(
        concat(
            convert(offer_contract, bytes32),
            convert(offer_token_id, bytes32),
            convert(wanted_contract, bytes32),
            convert(wanted_token_id, bytes32)
        )
    )


@view
@external
def offer_can_complete(
    offer_contract: address,
    offer_token_id: uint256,
    wanted_contract: address,
    wanted_token_id: uint256,
) -> bool:
    return (
        ERC721(offer_contract).getApproved(offer_token_id) == self and
        ERC721(wanted_contract).getApproved(wanted_token_id) == self
    )

@internal
@view
def _pack_offer(
    offer_contract: address,
    offer_token_id: uint256,
    wanted_contract: address,
    wanted_token_id: uint256
) -> Bytes[128]:
    return concat(
        convert(offer_contract, bytes32),
        convert(offer_token_id, bytes32),
        convert(wanted_contract, bytes32),
        convert(wanted_token_id, bytes32)
    )

@internal
@view
def _hash_offer(
    offer_contract: address,
    offer_token_id: uint256,
    wanted_contract: address,
    wanted_token_id: uint256
) -> bytes32:
    packed: Bytes[128] = self._pack_offer(
        offer_contract,
        offer_token_id,
        wanted_contract,
        wanted_token_id
    )
    return keccak256(packed)

@internal
@view
def _signer(
    offer_contract: address,
    offer_token_id: uint256,
    wanted_contract: address,
    wanted_token_id: uint256,
    signature: Bytes[65]
) -> (address, bytes32):
    param_hash: bytes32 = self._hash_params(
        offer_contract,
        offer_token_id,
        wanted_contract,
        wanted_token_id
    )
    p_hash: bytes32 = keccak256(self._prefix_hash(param_hash))
    return self._recover(p_hash, signature), param_hash

@external
@view
def signer(
    offer_contract: address,
    offer_token_id: uint256,
    wanted_contract: address,
    wanted_token_id: uint256,
    signature: Bytes[65]
) -> (address, bytes32):
    return self._signer(
        offer_contract,
        offer_token_id,
        wanted_contract,
        wanted_token_id,
        signature
    )


@external
def offer(
    offer_contract: address,
    offer_token_id: uint256,
    wanted_contract: address,
    wanted_token_id: uint256,
    signature: Bytes[65],
):
    v: uint256 = 0
    r: uint256 = 0
    s: uint256 = 0
    signer: address = empty(address)
    param_hash: bytes32 = empty(bytes32)

    signer, param_hash = self._signer(
        offer_contract,
        offer_token_id,
        wanted_contract,
        wanted_token_id,
        signature
    )

    assert self.offers[param_hash] == empty(address), "offer-exists"
    assert signer == ERC721(offer_contract).ownerOf(offer_token_id), "signer-not-owner"
    assert self == ERC721(offer_contract).getApproved(offer_token_id), "contract-not-approved"

    self.offers[param_hash] = signer

    log Offer(wanted_contract, wanted_token_id, offer_contract, offer_token_id)


@external
def accept(
    offer_contract: address,
    offer_token_id: uint256,
    wanted_contract: address,
    wanted_token_id: uint256,
    signature: Bytes[65],
):
    v: uint256 = 0
    r: uint256 = 0
    s: uint256 = 0
    signer: address = empty(address)
    param_hash: bytes32 = empty(bytes32)

    signer, param_hash = self._signer(
        offer_contract,
        offer_token_id,
        wanted_contract,
        wanted_token_id,
        signature
    )

    assert self.offers[param_hash] != empty(address), "offer-does-not-exist"
    assert signer == ERC721(wanted_contract).ownerOf(wanted_token_id), "signer-not-owner"
    assert self == ERC721(wanted_contract).getApproved(wanted_token_id), "contract-not-approved"

    offer_owner: address = self.offers[param_hash]

    # Remove the offer record
    self.offers[param_hash] = empty(address)

    # Transfer the offered token
    ERC721(offer_contract).safeTransferFrom(
        offer_owner,
        signer,
        offer_token_id,
        empty(Bytes[1])
    )

    # Transfer the wanted token
    ERC721(wanted_contract).safeTransferFrom(
        signer,
        offer_owner,
        wanted_token_id,
        empty(Bytes[1])
    )

    log Accept(wanted_contract, wanted_token_id, offer_contract, offer_token_id)

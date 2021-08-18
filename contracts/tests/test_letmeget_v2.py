import pytest
from eth_utils import to_bytes, to_hex
from eth_account.account import Account
from eth_account.messages import defunct_hash_message
from web3 import Web3
from brownie import (
    LetMeGet_v2,
    ApesMock,
    RatsMock,
    accounts,
    reverts,
)

ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"
PREFIX = b"\x19Ethereum Signed Message:\n32"


def normalize_signed_data(
    offer_contract, offer_token_id, wanted_contract, wanted_token_id, expires
):
    return [
        Web3.toBytes(to_bytes(hexstr=offer_contract)).rjust(32, b"\0"),
        Web3.toBytes(offer_token_id).rjust(32, b"\0"),
        Web3.toBytes(to_bytes(hexstr=wanted_contract)).rjust(32, b"\0"),
        Web3.toBytes(wanted_token_id).rjust(32, b"\0"),
        Web3.toBytes(expires).rjust(32, b"\0"),
    ]


def hash_message(offer_hash):
    return Web3.solidityKeccak(
        ["bytes32", "bytes32"],
        [PREFIX, offer_hash],
    )


def hash_params(
    offer_contract, offer_token_id, wanted_contract, wanted_token_id, expires
):
    return Web3.solidityKeccak(
        ["bytes32", "bytes32", "bytes32", "bytes32", "bytes32"],
        normalize_signed_data(
            offer_contract,
            offer_token_id,
            wanted_contract,
            wanted_token_id,
            expires,
        ),
    )


def sign_offer(
    account,
    offer_contract,
    offer_token_id,
    wanted_contract,
    wanted_token_id,
    expires,
) -> (str, str):
    """ Sign offer data with given account """
    acc = Account.from_key(account.private_key)
    offer_hash = hash_params(
        offer_contract,
        offer_token_id,
        wanted_contract,
        wanted_token_id,
        expires,
    )
    prefixed_offer_hash = defunct_hash_message(offer_hash)

    signed = acc.signHash(prefixed_offer_hash)
    return signed.signature.hex(), prefixed_offer_hash, offer_hash


@pytest.fixture
def signers():
    return accounts.from_mnemonic(
        "buffalo cinnamon glory chalk require inform strike ginger crop sell hidden cart",
        count=2,
        offset=0,
    )


@pytest.fixture
def letmegetv2():
    return accounts[0].deploy(LetMeGet_v2)


@pytest.fixture
def apes():
    return accounts[0].deploy(ApesMock)


@pytest.fixture
def rats():
    return accounts[0].deploy(RatsMock)


def approve(token, from_address, approved_address, token_id):
    tx = token.approve(approved_address, token_id, {"from": from_address})
    tx.wait(1)
    assert tx.status == 1
    return tx


def transfer_token(token, from_address, to_address, token_id):
    tx = token.transferFrom(
        from_address, to_address, token_id, {"from": from_address}
    )
    tx.wait(1)
    assert tx.status == 1
    return tx


def test_mocks(rats, apes):
    assert apes.address is not None


def test_version(letmegetv2):
    assert letmegetv2.version() == 2


def test_offer_cannot_complete(apes, rats, letmegetv2):
    assert letmegetv2.address is not None, "LetMeGet_v2 did not deploy"

    # Verify the initial state of the contract
    assert apes.getApproved(1) == ZERO_ADDRESS
    assert rats.getApproved(1) == ZERO_ADDRESS
    assert (
        letmegetv2.offer_can_complete(apes.address, 1, rats.address, 1, 999999)
        is False
    ), "Offer has not been made yet"


def test_signature_works(web3, signers, apes, rats, letmegetv2):
    """ LMG contract hash and sign messages properly """
    bruce = signers[0]
    expires = 999999

    signature, message_hash, offer_hash = sign_offer(
        bruce, apes.address, 1, rats.address, 1, expires
    )
    signer = Account.recoverHash(message_hash, signature=signature)

    contract_signer, contract_hash = letmegetv2.offer_signer(
        apes.address, 1, rats.address, 1, expires, signature
    )

    assert contract_hash == to_hex(offer_hash), "hash mismatch"
    assert signer == bruce.address, "Local sig check failed"
    assert signer == contract_signer, "Invalid sig"


def test_offer_fails_if_not_owner(web3, signers, apes, rats, letmegetv2):
    """ Account that signed the offer must be the owner """
    bruce = signers[1]
    offer_contract = apes.address
    offer_token_id = 1
    wanted_contract = rats.address
    wanted_token_id = 1
    expires = 999999

    signature, _, _ = sign_offer(
        bruce,
        offer_contract,
        offer_token_id,
        wanted_contract,
        wanted_token_id,
        expires,
    )

    assert apes.getApproved(1) == ZERO_ADDRESS

    with reverts("signer-not-owner"):
        letmegetv2.offer(
            offer_contract,
            offer_token_id,
            wanted_contract,
            wanted_token_id,
            expires,
            signature,
            {"from": bruce},
        )


def test_offer_fails_if_not_approved(web3, signers, apes, rats, letmegetv2):
    """ LMG contract must be approved to make an offer """
    bruce = signers[0]
    offer_contract = apes.address
    offer_token_id = 1
    wanted_contract = rats.address
    wanted_token_id = 1
    expires = 999999

    signature, message_hash, _ = sign_offer(
        bruce,
        offer_contract,
        offer_token_id,
        wanted_contract,
        wanted_token_id,
        expires,
    )

    assert apes.getApproved(offer_token_id) == ZERO_ADDRESS
    assert apes.ownerOf(offer_token_id) == accounts[0]

    transfer_token(apes, accounts[0], bruce.address, offer_token_id)

    contract_signer, _ = letmegetv2.offer_signer(
        apes.address, 1, rats.address, 1, expires, signature
    )
    assert apes.ownerOf(1) == bruce.address, "Transfer not completed"
    assert contract_signer == bruce.address, "Invalid signature"

    with reverts("contract-not-approved"):
        letmegetv2.offer(
            apes.address,
            1,
            rats.address,
            1,
            expires,
            signature,
            {"from": bruce},
        )


def test_offer_fails_if_expires_low(web3, signers, apes, rats, letmegetv2):
    """ LMG contract must be approved to make an offer """
    bruce = signers[0]
    offer_contract = apes.address
    offer_token_id = 1
    wanted_contract = rats.address
    wanted_token_id = 1
    # Inentionally too low for the test
    expires = 1

    signature, message_hash, _ = sign_offer(
        bruce,
        offer_contract,
        offer_token_id,
        wanted_contract,
        wanted_token_id,
        expires,
    )

    assert apes.getApproved(offer_token_id) == ZERO_ADDRESS
    assert apes.ownerOf(offer_token_id) == accounts[0]

    transfer_token(apes, accounts[0], bruce.address, offer_token_id)

    contract_signer, _ = letmegetv2.offer_signer(
        apes.address, 1, rats.address, 1, expires, signature
    )
    assert apes.ownerOf(1) == bruce.address, "Transfer not completed"
    assert contract_signer == bruce.address, "Invalid signature"

    with reverts("expires-too-low"):
        letmegetv2.offer(
            apes.address,
            1,
            rats.address,
            1,
            expires,
            signature,
            {"from": bruce},
        )


def test_offer_succeeds(signers, apes, rats, letmegetv2):
    """ Test that an offer succeeds """
    bruce = signers[0]
    offer_contract = apes.address
    offer_token_id = 1
    wanted_contract = rats.address
    wanted_token_id = 1
    expires = 999999

    # Fund user
    transfer_token(apes, accounts[0], bruce.address, offer_token_id)

    # Approve LMG contract
    approve(apes, bruce.address, letmegetv2.address, offer_token_id)

    # Create offer signature
    signature, _, _ = sign_offer(
        bruce,
        offer_contract,
        offer_token_id,
        wanted_contract,
        wanted_token_id,
        expires,
    )

    offer_tx = letmegetv2.offer(
        offer_contract,
        offer_token_id,
        wanted_contract,
        wanted_token_id,
        expires,
        signature,
        {"from": bruce},
    )

    offer_tx.wait(1)

    assert offer_tx.status == 1, "Offer tx failed"
    assert "Offer" in offer_tx.events, "Offer event not found"
    assert offer_tx.events["Offer"]["offer_contract"] == offer_contract
    assert offer_tx.events["Offer"]["offer_token_id"] == offer_token_id
    assert offer_tx.events["Offer"]["wanted_contract"] == wanted_contract
    assert offer_tx.events["Offer"]["wanted_token_id"] == wanted_token_id
    assert offer_tx.events["Offer"]["expires"] == expires


def test_accept_fails_if_no_offer(web3, signers, apes, rats, letmegetv2):
    """ Account that signed the offer must be the owner """
    bruce = signers[0]
    dandi = signers[1]
    offer_contract = apes.address
    offer_token_id = 2
    wanted_contract = rats.address
    wanted_token_id = 2
    expires = 999999

    signature, _, _ = sign_offer(
        dandi,
        offer_contract,
        offer_token_id,
        wanted_contract,
        wanted_token_id,
        expires,
    )

    with reverts("offer-does-not-exist"):
        letmegetv2.accept(
            offer_contract,
            offer_token_id,
            wanted_contract,
            wanted_token_id,
            expires,
            signature,
            {"from": bruce},
        )


def test_accept_fails_if_not_owner(signers, apes, rats, letmegetv2):
    """ Test that a trade succeeds """
    bruce = signers[0]
    dandi = signers[1]
    offer_contract = apes.address
    offer_token_id = 4
    wanted_contract = rats.address
    wanted_token_id = 5
    expires = 999999

    # Fund users
    transfer_token(apes, accounts[0], bruce.address, offer_token_id)

    # Approve LMG contract
    approve(apes, bruce.address, letmegetv2.address, offer_token_id)

    # Create offer signature
    offer_signature, _, _ = sign_offer(
        bruce,
        offer_contract,
        offer_token_id,
        wanted_contract,
        wanted_token_id,
        expires,
    )

    offer_tx = letmegetv2.offer(
        offer_contract,
        offer_token_id,
        wanted_contract,
        wanted_token_id,
        expires,
        offer_signature,
        {"from": bruce},
    )
    offer_tx.wait(1)

    assert offer_tx.status == 1, "Offer tx failed"

    # Create offer signature
    accept_signature, _, _ = sign_offer(
        dandi,
        offer_contract,
        offer_token_id,
        wanted_contract,
        wanted_token_id,
        expires,
    )

    with reverts("signer-not-owner"):
        letmegetv2.accept(
            offer_contract,
            offer_token_id,
            wanted_contract,
            wanted_token_id,
            expires,
            accept_signature,
            {"from": dandi},
        )


def test_accept_fails_if_not_approved(signers, apes, rats, letmegetv2):
    """ Test that a trade succeeds """
    bruce = signers[0]
    dandi = signers[1]
    offer_contract = apes.address
    offer_token_id = 6
    wanted_contract = rats.address
    wanted_token_id = 7
    expires = 999999

    # Fund users
    transfer_token(apes, accounts[0], bruce.address, offer_token_id)
    transfer_token(rats, accounts[0], dandi.address, wanted_token_id)

    # Approve LMG contract
    approve(apes, bruce.address, letmegetv2.address, offer_token_id)

    # Create offer signature
    offer_signature, _, _ = sign_offer(
        bruce,
        offer_contract,
        offer_token_id,
        wanted_contract,
        wanted_token_id,
        expires,
    )

    offer_tx = letmegetv2.offer(
        offer_contract,
        offer_token_id,
        wanted_contract,
        wanted_token_id,
        expires,
        offer_signature,
        {"from": bruce},
    )
    offer_tx.wait(1)

    assert offer_tx.status == 1, "Offer tx failed"

    # Create offer signature
    accept_signature, _, _ = sign_offer(
        dandi,
        offer_contract,
        offer_token_id,
        wanted_contract,
        wanted_token_id,
        expires,
    )

    with reverts("contract-not-approved"):
        letmegetv2.accept(
            offer_contract,
            offer_token_id,
            wanted_contract,
            wanted_token_id,
            expires,
            accept_signature,
            {"from": dandi},
        )


def test_accept_fails_if_expired(web3, signers, apes, rats, letmegetv2):
    """ Test that a trade failed if offer expired """
    bruce = signers[0]
    dandi = signers[1]
    offer_contract = apes.address
    offer_token_id = 6
    wanted_contract = rats.address
    wanted_token_id = 7

    # Fund users
    transfer_token(apes, accounts[0], bruce.address, offer_token_id)
    transfer_token(rats, accounts[0], dandi.address, wanted_token_id)

    # Approve LMG contract
    approve(apes, bruce.address, letmegetv2.address, offer_token_id)

    expiry = 5
    expires = web3.eth.block_number + expiry  # 5 blocks from now

    # Create offer signature
    offer_signature, _, _ = sign_offer(
        bruce,
        offer_contract,
        offer_token_id,
        wanted_contract,
        wanted_token_id,
        expires,
    )

    offer_tx = letmegetv2.offer(
        offer_contract,
        offer_token_id,
        wanted_contract,
        wanted_token_id,
        expires,
        offer_signature,
        {"from": bruce},
    )
    offer_tx.wait(1)

    assert offer_tx.status == 1, "Offer tx failed"

    # Fast forward the chain
    block_number = web3.eth.block_number
    for _ in range(expiry):
        web3.testing.mine()
    assert web3.eth.block_number == block_number + expiry, "did not FF"
    # web3.provider.make_request('evm_increaseTime', [secs])

    # Create offer signature
    accept_signature, _, _ = sign_offer(
        dandi,
        offer_contract,
        offer_token_id,
        wanted_contract,
        wanted_token_id,
        expires,
    )

    with reverts("offer-expired"):
        letmegetv2.accept(
            offer_contract,
            offer_token_id,
            wanted_contract,
            wanted_token_id,
            expires,
            accept_signature,
            {"from": dandi},
        )


def test_accept_fails_if_revoke(signers, apes, rats, letmegetv2):
    """ Test that a trade failed if offer was revoked """
    bruce = signers[0]
    dandi = signers[1]
    offer_contract = apes.address
    offer_token_id = 6
    wanted_contract = rats.address
    wanted_token_id = 7
    expires = 999999

    # Fund users
    transfer_token(apes, accounts[0], bruce.address, offer_token_id)
    transfer_token(rats, accounts[0], dandi.address, wanted_token_id)

    # Approve LMG contract
    approve(apes, bruce.address, letmegetv2.address, offer_token_id)

    # Create offer signature
    offer_signature, _, _ = sign_offer(
        bruce,
        offer_contract,
        offer_token_id,
        wanted_contract,
        wanted_token_id,
        expires,
    )

    offer_tx = letmegetv2.offer(
        offer_contract,
        offer_token_id,
        wanted_contract,
        wanted_token_id,
        expires,
        offer_signature,
        {"from": bruce},
    )
    offer_tx.wait(1)

    assert offer_tx.status == 1, "Offer tx failed"

    revoke_tx = letmegetv2.revoke(
        offer_contract,
        offer_token_id,
        wanted_contract,
        wanted_token_id,
        expires,
        offer_signature,
        {"from": bruce},
    )
    offer_tx.wait(1)

    assert offer_tx.status == 1, "Offer tx failed"

    # Create offer signature
    accept_signature, _, _ = sign_offer(
        dandi,
        offer_contract,
        offer_token_id,
        wanted_contract,
        wanted_token_id,
        expires,
    )

    with reverts("offer-revoked"):
        letmegetv2.accept(
            offer_contract,
            offer_token_id,
            wanted_contract,
            wanted_token_id,
            expires,
            accept_signature,
            {"from": dandi},
        )


def test_accept_succeeds(signers, apes, rats, letmegetv2):
    """ Test that a trade succeeds """
    bruce = signers[0]
    dandi = signers[1]
    offer_contract = apes.address
    offer_token_id = 8
    wanted_contract = rats.address
    wanted_token_id = 9
    expires = 999999

    # Fund users
    transfer_token(apes, accounts[0], bruce.address, offer_token_id)
    transfer_token(rats, accounts[0], dandi.address, wanted_token_id)

    # Approve LMG contract
    approve(apes, bruce.address, letmegetv2.address, offer_token_id)
    approve(rats, dandi.address, letmegetv2.address, wanted_token_id)

    # Create offer signature
    offer_signature, _, _ = sign_offer(
        bruce,
        offer_contract,
        offer_token_id,
        wanted_contract,
        wanted_token_id,
        expires,
    )

    offer_tx = letmegetv2.offer(
        offer_contract,
        offer_token_id,
        wanted_contract,
        wanted_token_id,
        expires,
        offer_signature,
        {"from": bruce},
    )

    offer_tx.wait(1)

    assert offer_tx.status == 1, "Offer tx failed"

    # Create offer signature
    accept_signature, _, _ = sign_offer(
        dandi,
        offer_contract,
        offer_token_id,
        wanted_contract,
        wanted_token_id,
        expires,
    )

    accept_tx = letmegetv2.accept(
        offer_contract,
        offer_token_id,
        wanted_contract,
        wanted_token_id,
        expires,
        accept_signature,
        {"from": dandi},
    )

    accept_tx.wait(1)

    assert accept_tx.status == 1, "Accept tx failed"
    assert "Accept" in accept_tx.events, "Accept event not found"
    assert accept_tx.events["Accept"]["offer_contract"] == offer_contract
    assert accept_tx.events["Accept"]["offer_token_id"] == offer_token_id
    assert accept_tx.events["Accept"]["wanted_contract"] == wanted_contract
    assert accept_tx.events["Accept"]["wanted_token_id"] == wanted_token_id
    assert accept_tx.events["Accept"]["expires"] == expires

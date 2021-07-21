import some from "lodash/some"
import React, { MouseEvent, ReactElement } from "react"
import { ethers, Contract } from "ethers"
import Button from "@material-ui/core/Button"
import FavoriteIcon from "@material-ui/icons/Favorite"

import { TradeSide } from "../enums"
import { EthereumContext } from "../utils/eth"

const abiCoder = ethers.utils.defaultAbiCoder

interface TradeButtonProps {
  side: TradeSide
  eth?: EthereumContext
  offerContractAddress: string
  offerTokenID: number
  wantedContractAddress: string
  wantedTokenID: number
  showMakeOffer: (show: boolean) => void
  showAcceptOffer: (show: boolean) => void
}

function packOffer(
  offerContractAddress: string,
  offerTokenID: number,
  wantedContractAddress: string,
  wantedTokenID: number
) {
  // TODO: Probably wrong, need rjust padding?
  return abiCoder.encode(
    ["bytes32", "bytes32", "bytes32", "bytes32"],
    [offerContractAddress, offerTokenID, wantedContractAddress, wantedTokenID]
  )
  //ethers.utils.zeroPad
}

function hashOffer(
  offerContractAddress: string,
  offerTokenID: number,
  wantedContractAddress: string,
  wantedTokenID: number
) {
  const prefix = "\x19Ethereum Signed Message:\n32"
  const paramHash = ethers.utils.solidityKeccak256(
    ["bytes32", "bytes32", "bytes32", "bytes32"],
    [offerContractAddress, offerTokenID, wantedContractAddress, wantedTokenID]
  )
  /*const bytes = ethers.utils.concat([
    ethers.utils.toUtf8Bytes(prefix),
    ethers.utils.toUtf8Bytes(paramHash),
  ])
  const hash = ethers.utils.keccak256(msgBytes)*/
  return ethers.utils.solidityKeccak256(
    ["string", "bytes32"],
    [prefix, paramHash]
  )
}

export default function TradeButton(props: TradeButtonProps): ReactElement {
  const {
    side,
    eth,
    offerContractAddress,
    offerTokenID,
    wantedContractAddress,
    wantedTokenID,
    showMakeOffer,
    showAcceptOffer,
  } = props

  if (
    some(
      [
        offerContractAddress,
        offerTokenID,
        wantedContractAddress,
        wantedTokenID,
      ],
      (v: string | number) => !v
    )
  ) {
    return <FavoriteIcon className="make-offer" />
  }

  function makeOffer() {
    showMakeOffer(true)
  }

  function acceptOffer() {
    showAcceptOffer(true)
  }

  /*async function makeOffer() {
    const { signer, letMeGetv1 } = eth

    console.log("makeOffer:", makeOffer)

    // TODO: Verify
    const signerAddress = await signer.getAddress()
    const packed = packOffer(
      offerContractAddress,
      offerTokenID,
      wantedContractAddress,
      wantedTokenID
    )
    console.log("packed:", packed)
    const signature = await signer.signMessage(packed)
    console.log("signature:", signature)
    console.log("letMeGetv1.signer:", letMeGetv1.signer)
    // NOTE: letMeGetv1.signer will be the ethers.js signer, not our method
    const contractSigner = await letMeGetv1.functions.signer(
      offerContractAddress,
      offerTokenID,
      wantedContractAddress,
      wantedTokenID,
      signature
    )

    if (contractSigner !== signerAddress) {
      throw new Error("Signers do not match")
    }

    await letMeGetv1.offer(
      offerContractAddress,
      offerTokenID,
      wantedContractAddress,
      wantedTokenID,
      signature
    )
  }

  function acceptOffer() {
    console.log("acceptOffer:", acceptOffer)
  }*/

  return (
    <Button
      className="make-offer"
      variant="contained"
      color="primary"
      disabled={!eth}
      onClick={side === TradeSide.Offer ? makeOffer : acceptOffer}
    >
      {side === TradeSide.Offer ? "Make Offer" : "Accept Offer"}
    </Button>
  )
}

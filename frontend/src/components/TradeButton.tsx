import some from "lodash/some"
import React, { ReactElement } from "react"
import { ethers } from "ethers"
import Button from "@material-ui/core/Button"
import FavoriteIcon from "@material-ui/icons/Favorite"

import { TradeSide } from "../enums"
import { EthereumContext } from "../utils/eth"

interface TradeButtonProps {
  side: TradeSide
  eth?: EthereumContext
  invalid?: boolean
  offerContractAddress: string
  offerTokenID: number
  wantedContractAddress: string
  wantedTokenID: number
  showMakeOffer: (show: boolean) => void
  showAcceptOffer: (show: boolean) => void
}

function anyNot(items: Array<any>) {
  return some(items, (v: string | number) => !v)
}

export default function TradeButton(props: TradeButtonProps): ReactElement {
  const {
    side,
    eth,
    invalid = false,
    offerContractAddress,
    offerTokenID,
    wantedContractAddress,
    wantedTokenID,
    showMakeOffer,
    showAcceptOffer,
  } = props

  if (
    anyNot([
      !invalid,
      offerContractAddress,
      offerTokenID,
      wantedContractAddress,
      wantedTokenID,
    ])
  ) {
    return <FavoriteIcon className="make-offer" />
  }

  function makeOffer() {
    showMakeOffer(true)
  }

  function acceptOffer() {
    showAcceptOffer(true)
  }

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

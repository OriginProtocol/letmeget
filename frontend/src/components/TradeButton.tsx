import some from "lodash/some"
import React, { ReactElement } from "react"
import Button from "@material-ui/core/Button"
import FavoriteIcon from "@material-ui/icons/Favorite"

import { Trade as TradeInterface } from "../interfaces"
import { TradeSide } from "../enums"
import { EthereumContext } from "../utils/eth"

interface TradeButtonProps {
  trade: TradeInterface
  eth?: EthereumContext
  showMakeOffer: (show: boolean) => void
  showAcceptOffer: (show: boolean) => void
}

function anyNot(items: Array<any>) {
  return some(items, (v: string | number) => !v)
}

export default function TradeButton(props: TradeButtonProps): ReactElement {
  const { trade, eth, showMakeOffer, showAcceptOffer } = props

  if (
    !trade ||
    anyNot([
      trade.valid,
      trade.offerContract && trade.offerContract.signer,
      trade.offerTokenID,
      trade.wantedContract && trade.wantedContract.signer,
      trade.wantedTokenID,
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
      onClick={trade.side === TradeSide.Offer ? makeOffer : acceptOffer}
    >
      {trade.side === TradeSide.Offer ? "Make Offer" : "Accept Offer"}
    </Button>
  )
}

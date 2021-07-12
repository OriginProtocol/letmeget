import React, { ReactElement } from "react"
import Grid from "@material-ui/core/Grid"

import { Ethereum } from "../utils/context"
import { EthereumContext } from "../utils/eth"
import { TradeSide } from "../enums"
import TokenSelector from "./TokenSelector"

//import "./TradeDisplay.css"

interface TradeDisplayProps {}

export default function TradeDisplay(props?: TradeDisplayProps): ReactElement {
  return (
    <Ethereum.Consumer>
      {(eth: EthereumContext) => (
        <div className="trade-display">
          <Grid container spacing={3}>
            <Grid item xs={6}>
              <TokenSelector
                side={TradeSide.Offer}
                provider={eth ? eth.provider : null}
              />
            </Grid>
            <Grid item xs={6}>
              <TokenSelector
                side={TradeSide.Wanted}
                provider={eth ? eth.provider : null}
              />
            </Grid>
          </Grid>
        </div>
      )}
    </Ethereum.Consumer>
  )
}

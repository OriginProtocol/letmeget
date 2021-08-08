import React, { ReactElement } from "react"
import { Typography } from "@material-ui/core"
import { Alert } from "@material-ui/lab"

import { Ethereum } from "../utils/context"
import { EthereumContext } from "../utils/eth"

/**
 * Alert the user if the network is not Ethereum miannet
 */
export default function NetworkAlert(): ReactElement {
  return (
    <>
      <Ethereum.Consumer>
        {(eth: EthereumContext) => (
          <>
            {eth && eth.networkId !== "1" ? (
              <Alert severity="warning" className="network-alert">
                <Typography variant="body1">
                  You are connected to the {eth.networkName} network
                </Typography>
              </Alert>
            ) : null}
          </>
        )}
      </Ethereum.Consumer>
    </>
  )
}

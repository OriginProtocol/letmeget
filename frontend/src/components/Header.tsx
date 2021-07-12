import React, { ChangeEventHandler, ReactElement } from "react"
import Alert from "@material-ui/lab/Alert"

import { Ethereum } from "../utils/context"
import { EthereumContext } from "../utils/eth"
import NetworkSelector from "./NetworkSelector"

import "./Header.scss"

interface HeaderProps {
  network: string
  onNetworkChange: ChangeEventHandler
}

const Header = (props: HeaderProps): ReactElement => {
  return (
    <Ethereum.Consumer>
      {(eth: EthereumContext) => (
        <header className="header">
          <h1 className="brand">
            <img src="/static/images/heart.png" />
            Let Me Get
          </h1>
          {eth && eth.error ? (
            <Alert severity="error">{eth.error}</Alert>
          ) : null}
          <NetworkSelector
            network={props.network}
            onNetworkChange={props.onNetworkChange}
          />
        </header>
      )}
    </Ethereum.Consumer>
  )
}

export default Header

import React, { ChangeEventHandler, ReactElement } from "react"
import { NETWORKS } from "../utils/eth"

//import "./NetworkSelector.css"

interface NetworkSelectorProps {
  network: string
  networks?: Array<string>
  onNetworkChange: ChangeEventHandler
}

const NetworkSelector = (props: NetworkSelectorProps): ReactElement => {
  const networks = props.networks ? props.networks : NETWORKS
  const children = Object.keys(networks).map((k) => {
    return (
      <option key={k} value={k}>
        {k} - {networks[k]}
      </option>
    )
  })
  return (
    <div className="network-selector">
      Network: &nbsp;
      <select value={props.network} onChange={props.onNetworkChange}>
        {children}
      </select>
    </div>
  )
}

export default NetworkSelector

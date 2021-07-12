import { Provider } from "@ethersproject/abstract-provider"
import React, { ReactElement } from "react"
import Paper from "@material-ui/core/Paper"
import TextField from "@material-ui/core/TextField"
import Alert from "@material-ui/lab/Alert"

import useERC721Metadata from "../hooks/useERC721Metadata"

import { TradeSide } from "../enums"
import NFTArt, { NFTArtProps } from "./NFTArt"

import "./TokenSelector.scss"

const DEFAULT_OFFER_IMAGE = "/static/images/offer-hand.png"
const DEFAULT_WANTED_IMAGE = "/static/images/accept-hand.png"

const EXAMPLE_TOKEN_REFS = [
  "https://opensea.io/assets/0x99b9791d1580bf504a1709d310923a46237c8f2c/505",
  "https://rarible.com/token/0x7bd29408f11d2bfc23c34f18275bbf23bb716bc7:16686?tab=details",
  //  '0xdb55584e5104505a6b38776ee4dcba7dd6bb25fe:6606'
]

interface TokenSelectorProps {
  side: TradeSide
  provider: Provider
}

export default function TokenSelector(props: TokenSelectorProps): ReactElement {
  const { error, tokenMeta, setTokenReference } = useERC721Metadata(
    props.provider,
    {
      image:
        props.side === TradeSide.Offer
          ? DEFAULT_OFFER_IMAGE
          : DEFAULT_WANTED_IMAGE,
    }
  )

  const label = `${props.side === TradeSide.Offer ? "Offered" : "Wanted"} NFT`
  const placeholder = EXAMPLE_TOKEN_REFS[props.side === TradeSide.Offer ? 0 : 1]
  console.log("tokenMeta:", tokenMeta)
  return (
    <Paper className="token-selector">
      <NFTArt {...tokenMeta} maxWidth="400px" />
      <TextField
        className="token-reference"
        label={label}
        placeholder={placeholder}
        variant="outlined"
        onChange={setTokenReference}
      />
      {error ? <Alert severity="error">{error}</Alert> : null}
    </Paper>
  )
}

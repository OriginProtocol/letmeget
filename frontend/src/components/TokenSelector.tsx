import { Provider } from "@ethersproject/abstract-provider"
import React, { useEffect, ReactElement, ChangeEvent } from "react"
import Paper from "@material-ui/core/Paper"
import TextField from "@material-ui/core/TextField"
import Alert from "@material-ui/lab/Alert"

import useERC721Metadata from "../hooks/useERC721Metadata"

import { TradeSide } from "../enums"
import NFTArt from "./NFTArt"

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
  defaultValue: string
  showInvalid?: boolean
  setDefault: (v: any) => void
  setToken: (a: string, i: string) => void
}

export default function TokenSelector(props: TokenSelectorProps): ReactElement {
  const { setToken, side, provider, showInvalid, setDefault, defaultValue } =
    props
  const { error, tokenAddress, tokenID, tokenMeta, setTokenReference } =
    useERC721Metadata(provider, {
      image:
        side === TradeSide.Offer ? DEFAULT_OFFER_IMAGE : DEFAULT_WANTED_IMAGE,
    })

  useEffect(() => {
    setToken(tokenAddress, tokenID)
  }, [tokenAddress, tokenID])

  useEffect(() => {
    setTokenReference(defaultValue)
  }, [defaultValue])

  const label = `${side === TradeSide.Offer ? "Offered" : "Wanted"} NFT`
  const placeholder = EXAMPLE_TOKEN_REFS[side === TradeSide.Offer ? 0 : 1]

  return (
    <Paper className="token-selector">
      <NFTArt
        {...tokenMeta}
        image={showInvalid ? "/static/images/redx.svg" : tokenMeta.image}
        maxWidth="400px"
      />
      <TextField
        className="token-reference"
        label={label}
        placeholder={placeholder}
        variant="outlined"
        onChange={(ev: ChangeEvent<HTMLInputElement>) => {
          setTokenReference(ev.target.value)
          setDefault(ev.target.value)
        }}
        defaultValue={defaultValue}
      />
      {error ? <Alert severity="error">{error}</Alert> : null}
    </Paper>
  )
}

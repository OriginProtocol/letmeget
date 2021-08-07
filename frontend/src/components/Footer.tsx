import React, { ReactElement } from "react"
import { Box, Paper, Typography } from "@material-ui/core"

import { EthereumContext } from "../utils/eth"

interface FooterProps {
  eth?: EthereumContext
}

export default function Footer(props: FooterProps): ReactElement {
  const { eth } = props
  const lmgEtherscanLink = eth ? (
    <a
      href={`https://${
        eth.networkId !== "1" ? `${eth.networkName}.` : ""
      }etherscan.io/address/${eth.letMeGetv1.address}`}
    >
      LetMeGet Contract
    </a>
  ) : (
    "LetMeGet Contract"
  )
  return (
    <Box id="footer">
      <Paper className="about">
        <Typography variant="h5">About</Typography>
        <Typography variant="body1">
          LetMeGet is a way to trustlessly trade ERC-721 non-fungible tokens on
          Ethereum networks. All trades are 1 for 1 and final. Owners of wanted
          NFTs <strong>are not notified</strong> when making an offer, though
          they will see your offer when visiting this dapp. This dapp is for
          trustlessly completing trade agreements you have made off-platform.
        </Typography>
        <Typography variant="body1">
          By making an offer, you are agreeing to trade a specific token for
          another. If the offer can be and is accepted, the tokens will
          automatically be transferred. To cancel an offer, you can remove the
          approval for the {lmgEtherscanLink}.
        </Typography>
      </Paper>
      <div className="copyright">
        <Typography variant="caption">
          &copy; Copyright 2021{" "}
          <a href="https://originprotocol.com">Origin Protocol, Inc</a>
        </Typography>
      </div>
    </Box>
  )
}

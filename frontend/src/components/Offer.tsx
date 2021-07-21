import every from "lodash/every"
import React, { useState, useEffect, MouseEvent, ReactElement } from "react"
import { ethers, Contract, utils } from "ethers"
import { Signer } from "@ethersproject/abstract-signer"
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  ListSubheader,
  Modal,
  Typography,
} from "@material-ui/core"
import Alert from "@material-ui/lab/Alert"
import ThumbUpIcon from "@material-ui/icons/ThumbUp"

import ActionDialog from "./ActionDialog"
import hashOffer from "../utils/hashOffer"

const { hexConcat, keccak256, arrayify } = utils

function remove0xPrefix(v: string): string {
  return v.startsWith("0x") ? v.slice(2) : v
}

function prefixMessage(msg: string): string {
  // 32 byte message
  //return `\x19Ethereum Signed Message:\n32${msg}`
  // String prefix in hex without length: 0x19457468657265756d205369676e6564204d6573736167653a0a33
  return `0x19457468657265756d205369676e6564204d6573736167653a0a3332${remove0xPrefix(
    msg
  )}`
}

interface OfferProps {
  open: boolean
  close: () => void
  letMeGetv1: Contract
  signer: Signer
  offerContract: Contract
  offerTokenID: number
  wantedContract: Contract
  wantedTokenID: number
}

const progressStyle = { height: "20", width: "20" }

export default function Offer(props: OfferProps): ReactElement {
  const [error, setError] = useState(null)
  const [pendingApprove, setPendingApprove] = useState(false)
  const [pendingOffer, setPendingOffer] = useState(false)
  const [offerExists, setOfferExists] = useState(false)
  const [lmgIsApproved, setLmgIsApproved] = useState(false)
  const {
    open,
    close,
    letMeGetv1,
    signer,
    offerContract,
    offerTokenID,
    wantedContract,
    wantedTokenID,
  } = props

  const haveNecessaryProps = every([
    offerContract,
    offerTokenID,
    wantedContract,
    wantedTokenID,
  ])

  function getApproved(): Promise<void> {
    return offerContract
      .connect(signer)
      .getApproved(offerTokenID)
      .then((approved: string) => {
        setLmgIsApproved(approved == letMeGetv1.address)
      })
      .catch((err: Error) => {
        console.error(err)
        setError(
          `Unable to get the approved account for token ID ${offerTokenID}`
        )
      })
  }

  async function getOfferer(): Promise<string> {
    if (!haveNecessaryProps) {
      return null
    }

    const offerHash = hashOffer(
      offerContract.address,
      offerTokenID,
      wantedContract.address,
      wantedTokenID
    )

    return await letMeGetv1.offers(offerHash)
  }

  async function onApprove() {
    setPendingApprove(true)
    try {
      await offerContract
        .connect(signer)
        .approve(letMeGetv1.address, offerTokenID)
      // No reason to await here
      getApproved()
    } catch (err) {
      console.error(err)
      setError(`Unable to get the approve LMG for token ID ${offerTokenID}`)
    }
    setPendingApprove(false)
  }

  function onCancelApprove() {
    close()
  }

  async function onOffer() {
    setPendingOffer(true)

    const offerHash = hashOffer(
      offerContract.address,
      offerTokenID,
      wantedContract.address,
      wantedTokenID
    )

    let signature
    try {
      signature = await signer.signMessage(arrayify(offerHash))
    } catch (err) {
      console.error(err)
      if (!err.message?.includes("User denied")) {
        setError(`Unable to get the approve LMG for token ID ${offerTokenID}`)
      }
      setPendingOffer(false)
      return
    }

    try {
      // TODO: Verify hash of prefixed message
      // TODO: Check our own ethereum stackexchange history for this?
      const [contractSigner, contractHash] = await letMeGetv1
        .connect(signer)
        .functions.signer(
          offerContract.address,
          offerTokenID,
          wantedContract.address,
          wantedTokenID,
          signature
        )
      const saddress = await signer.getAddress()

      if (contractSigner !== saddress) {
        setError("Unexpected signer")
        setPendingOffer(false)
        return
      }
    } catch (err) {
      console.error(err)
      setError(`Unable to verify signer with the LMG contract`)
      setPendingOffer(false)
      return
    }

    try {
      await letMeGetv1
        .connect(signer)
        .offer(
          offerContract.address,
          offerTokenID,
          wantedContract.address,
          wantedTokenID,
          signature
        )
    } catch (err) {
      console.error(err)
      setError(`Unable to get the approve LMG for token ID ${offerTokenID}`)
    }

    setPendingOffer(false)
  }

  function onCancelOffer() {
    close()
  }

  useEffect(() => {
    if (offerContract) {
      getApproved()
      getOfferer().then((offerer) => setOfferExists(!!offerer))
    }
  }, [offerContract, offerTokenID, wantedContract, wantedTokenID])

  const offerURL = haveNecessaryProps
    ? `https://letmeget.io/#/offer/${offerContract.address}:${offerTokenID}:${wantedContract.address}:${wantedTokenID}`
    : ""

  return (
    <>
      {open ? (
        <Dialog
          open={open}
          onClose={onCancelOffer}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          fullWidth={!!offerExists}
          maxWidth={offerExists ? "lg" : "sm"}
        >
          {offerExists ? (
            <>
              <DialogTitle id="alert-dialog-title">
                Offer already exists
              </DialogTitle>
              <DialogContent>
                <p>
                  Your offer exists already. To complete this offer, the owner
                  of the wanted NFT must accept your offer. You can send them
                  the following link to complete this process:
                </p>
                <p>
                  <a href={offerURL}>{offerURL}</a>
                </p>
              </DialogContent>
            </>
          ) : (
            <>
              <DialogTitle id="alert-dialog-title">Make Offer</DialogTitle>
              <DialogContent style={{ minWidth: "400px" }}>
                {error ? (
                  <Alert severity="error" style={{ marginBottom: "1.5rem" }}>
                    {error}
                  </Alert>
                ) : null}
                <Typography variant="subtitle1">
                  Complete these 2 steps to make your offer
                </Typography>
                <ol className="make-offer-steps">
                  <li key="approve">
                    <div className="label">
                      Approve LetMeGet to transfer your NFT
                    </div>
                    <div className="controls">
                      {lmgIsApproved ? (
                        <Button
                          aria-label="aprove"
                          variant="contained"
                          disabled
                        >
                          <ThumbUpIcon />
                        </Button>
                      ) : (
                        <Button
                          aria-label="aprove"
                          variant="contained"
                          color="primary"
                          onClick={onApprove}
                        >
                          {pendingApprove ? (
                            <CircularProgress color="inherit" size="20" />
                          ) : (
                            "Approve"
                          )}
                        </Button>
                      )}
                    </div>
                  </li>
                  <li key="make-offer">
                    <div className="label">Create offer on contract</div>
                    <div className="controls">
                      {offerExists ? (
                        <Button
                          aria-label="aprove"
                          variant="contained"
                          disabled
                        >
                          <ThumbUpIcon />
                        </Button>
                      ) : (
                        <Button
                          aria-label="aprove"
                          variant="contained"
                          color="primary"
                          onClick={onOffer}
                        >
                          {pendingOffer ? (
                            <CircularProgress color="inherit" size="20" />
                          ) : (
                            "Offer"
                          )}
                        </Button>
                      )}
                    </div>
                  </li>
                </ol>
              </DialogContent>
            </>
          )}
        </Dialog>
      ) : null}
    </>
  )
}

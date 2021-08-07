import React, { useState, useEffect, ReactElement } from "react"
import { Contract, utils } from "ethers"
import { Signer } from "@ethersproject/abstract-signer"
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  CircularProgress,
  Typography,
} from "@material-ui/core"
import Alert from "@material-ui/lab/Alert"
import ThumbUpIcon from "@material-ui/icons/ThumbUp"

import hashOffer from "../utils/hashOffer"
import { Offer, Trade as TradeInterface } from "../interfaces"

const { arrayify } = utils

interface AcceptOfferModalProps {
  open: boolean
  close: () => void
  letMeGetv1: Contract
  signer: Signer
  trade: TradeInterface
  onSuccess: () => void
}

export default function AcceptOfferModal(
  props: AcceptOfferModalProps
): ReactElement {
  const [error, setError] = useState(null)
  const [pendingApprove, setPendingApprove] = useState(false)
  const [pendingAccept, setPendingAccept] = useState(false)
  const [lmgIsApproved, setLmgIsApproved] = useState(false)
  const { open, close, letMeGetv1, signer, trade, onSuccess } = props
  const { offerContract, offerTokenID, wantedContract, wantedTokenID } = trade

  function getApproved(): Promise<void> {
    return wantedContract
      .connect(signer)
      .getApproved(wantedTokenID)
      .then((approved: string) => {
        setLmgIsApproved(approved == letMeGetv1.address)
      })
      .catch((err: Error) => {
        console.error(err)
        setError(
          `Unable to get the approved account for token ID ${wantedTokenID}`
        )
      })
  }

  async function onApprove() {
    setPendingApprove(true)
    try {
      const tx = await wantedContract
        .connect(signer)
        .approve(letMeGetv1.address, wantedTokenID)

      console.debug("tx:", tx)
      const receipt = await tx.wait()
      console.debug("receipt:", receipt)

      if (receipt.status) {
        // No reason to await here
        getApproved()
      } else {
        setError(`Transaction ${receipt.transactionHash} failed`)
      }
    } catch (err) {
      console.error(err)
      setError(`Unable to get the approve LMG for token ID ${offerTokenID}`)
    }
    setPendingApprove(false)
  }

  async function onAccept() {
    setPendingAccept(true)

    const offer: Offer = {
      offerContractAddress: offerContract.address,
      offerTokenID,
      wantedContractAddress: wantedContract.address,
      wantedTokenID,
    }
    const offerHash = hashOffer(offer)

    let signature
    try {
      signature = await signer.signMessage(arrayify(offerHash))
    } catch (err) {
      console.error(err)
      if (!err.message?.includes("User denied")) {
        setError(`Unable to get the approve LMG for token ID ${offerTokenID}`)
      }
      setPendingAccept(false)
      return
    }

    try {
      const tx = await letMeGetv1
        .connect(signer)
        .accept(
          offerContract.address,
          offerTokenID,
          wantedContract.address,
          wantedTokenID,
          signature
        )

      console.debug("tx:", tx)
      const receipt = await tx.wait()
      console.debug("receipt:", receipt)

      if (receipt.status) {
        setPendingAccept(false)
        onSuccess()
      } else {
        setError(`Transaction ${receipt.transactionHash} failed`)
      }
    } catch (err) {
      console.error(err)
      setError(`Unable to get the approve LMG for token ID ${offerTokenID}`)
      setPendingAccept(false)
    }
  }

  function onCancel() {
    close()
  }

  useEffect(() => {
    if (wantedContract && wantedTokenID) {
      getApproved()
    }
  }, [offerContract, offerTokenID, wantedContract, wantedTokenID])

  if (!signer || !wantedContract) return null

  return (
    <>
      {open ? (
        <Dialog
          open={open}
          onClose={onCancel}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          fullWidth={false}
          maxWidth="sm"
        >
          <DialogTitle id="alert-dialog-title">Accept Offer</DialogTitle>
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
                    <Button aria-label="aprove" variant="contained" disabled>
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
                <div className="label">Accept an offer</div>
                <div className="controls">
                  <Button
                    aria-label="aprove"
                    variant="contained"
                    color="primary"
                    onClick={onAccept}
                  >
                    {pendingAccept ? (
                      <CircularProgress color="inherit" size="20" />
                    ) : (
                      "Accept"
                    )}
                  </Button>
                </div>
              </li>
            </ol>
          </DialogContent>
        </Dialog>
      ) : null}
    </>
  )
}

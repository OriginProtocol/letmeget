import every from "lodash/every"
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

import { Trade as TradeInterface } from "../interfaces"

import hashOffer from "../utils/hashOffer"
import { ZERO_ADDRESS } from "../utils/eth"
import { OFFER_EXPIRY } from "../utils/const"

const { arrayify } = utils

function remove0xPrefix(v: string): string {
  return v.startsWith("0x") ? v.slice(2) : v
}

/* ethers.js prefixes itself, leaving for future reference
function prefixMessage(msg: string): string {
  // 32 byte message
  //return `\x19Ethereum Signed Message:\n32${msg}`
  // String prefix in hex without length: 0x19457468657265756d205369676e6564204d6573736167653a0a33
  return `0x19457468657265756d205369676e6564204d6573736167653a0a3332${remove0xPrefix(
    msg
  )}`
}*/

interface OfferProps {
  open: boolean
  close: () => void
  letMeGetv2: Contract
  signer: Signer
  trade: TradeInterface
  onSuccess: () => void
}

export default function Offer(props: OfferProps): ReactElement {
  const [error, setError] = useState(null)
  const [pendingApprove, setPendingApprove] = useState(false)
  const [pendingOffer, setPendingOffer] = useState(false)
  const [offerExists, setOfferExists] = useState(false)
  const [lmgIsApproved, setLmgIsApproved] = useState(false)
  const { open, close, letMeGetv2, signer, trade, onSuccess } = props
  const {
    offerContract,
    offerTokenID,
    wantedContract,
    wantedTokenID,
    expires,
  } = trade

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
        setLmgIsApproved(approved == letMeGetv2.address)
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

    const offerHash = hashOffer({
      offerContractAddress: offerContract.address,
      offerTokenID,
      wantedContractAddress: wantedContract.address,
      wantedTokenID,
      expires,
    })

    const offer = await letMeGetv2.offers(offerHash, { gasLimit: 100000 })

    // Offer is [revoked, signer, signature]
    return offer && offer[1] !== ZERO_ADDRESS ? offer[1] : null
  }

  async function onApprove() {
    // TODO: Check that user is owner
    setPendingApprove(true)
    try {
      const tx = await offerContract
        .connect(signer)
        .approve(letMeGetv2.address, offerTokenID)

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

  function closeModal() {
    if (error) setError("")
    close()
  }

  async function onOffer() {
    setPendingOffer(true)

    const offerHash = hashOffer({
      offerContractAddress: offerContract.address,
      offerTokenID,
      wantedContractAddress: wantedContract.address,
      wantedTokenID,
      expires,
    })

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
      const [contractSigner, contractHash] = await letMeGetv2
        .connect(signer)
        .functions.offer_signer(
          offerContract.address,
          offerTokenID,
          wantedContract.address,
          wantedTokenID,
          expires,
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
      const tx = await letMeGetv2
        .connect(signer)
        .offer(
          offerContract.address,
          offerTokenID,
          wantedContract.address,
          wantedTokenID,
          expires,
          signature
        )

      console.debug("tx:", tx)
      const receipt = await tx.wait()
      console.debug("receipt:", receipt)

      if (receipt.status) {
        onSuccess()
      } else {
        setError(`Transaction ${receipt.transactionHash} failed`)
      }
    } catch (err) {
      console.error(err)
      setError(`Unable to get the approve LMG for token ID ${offerTokenID}`)
    }

    setPendingOffer(false)
  }

  useEffect(() => {
    if (offerContract) {
      getApproved()
      if (expires) {
        getOfferer().then((offerer) => setOfferExists(!!offerer))
      }
    }
  }, [offerContract, offerTokenID, wantedContract, wantedTokenID, expires])

  const offerURL = haveNecessaryProps
    ? `https://letmeget.io/#/offer/${offerContract.address}:${offerTokenID}:${wantedContract.address}:${wantedTokenID}`
    : ""

  return (
    <>
      {open ? (
        <Dialog
          open={open}
          onClose={closeModal}
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
              <DialogTitle id="alert-dialog-title">
                Make a Trade Offer
              </DialogTitle>
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

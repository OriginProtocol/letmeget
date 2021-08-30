import React, { ReactElement } from "react"
import { Dialog, DialogContent, DialogTitle } from "@material-ui/core"

interface OfferCompleteProps {
  open: boolean
  close: () => void
}

export default function OfferComplete(props: OfferCompleteProps): ReactElement {
  const { open, close } = props

  return (
    <>
      {open ? (
        <Dialog
          open={open}
          onClose={close}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          fullWidth={false}
          maxWidth="sm"
        >
          <DialogTitle id="alert-dialog-title">Offer Complete</DialogTitle>
          <DialogContent>
            <p>
              Your offer has been made. You can send the owner of the wanted NFT
              the following link to complete the swap.
            </p>
            <p>
              <a href="https://letmeget.io">https://letmeget.io</a>
            </p>
          </DialogContent>
        </Dialog>
      ) : null}
    </>
  )
}

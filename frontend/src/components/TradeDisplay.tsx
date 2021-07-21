import React, { useEffect, useState, ReactElement } from "react"
import Grid from "@material-ui/core/Grid"
import { Contract } from "ethers"

import { Ethereum } from "../utils/context"
import { ERC721_ABI, EthereumContext } from "../utils/eth"
import useLocalStorage from "../hooks/useLocalStorage"
import { TradeSide } from "../enums"
import TokenSelector from "./TokenSelector"
import TradeButton from "./TradeButton"
import Offer from "./Offer"

interface TradeDisplayProps {
  side?: TradeSide
}

export default function TradeDisplay(props?: TradeDisplayProps): ReactElement {
  const { side = TradeSide.Offer } = props
  const [getItem, setItem] = useLocalStorage()
  const [offerContractAddress, setOfferContractAddress] = useState(null)
  const [offerContract, setOfferContract] = useState(null)
  const [offerID, setOfferID] = useState(null)
  const [wantedContractAddress, setWantedContractAddress] = useState(null)
  const [wantedContract, setWantedContract] = useState(null)
  const [wantedID, setWantedID] = useState(null)
  const [showMakeOffer, setShowMakeOffer] = useState(false)
  const [showAcceptOfferModal, setShowAcceptOfferModal] = useState(false)

  useEffect(() => {
    if (offerContractAddress) {
      setOfferContract(new Contract(offerContractAddress, ERC721_ABI))
    }
    if (wantedContractAddress) {
      setWantedContract(new Contract(wantedContractAddress, ERC721_ABI))
    }
  }, [offerContractAddress, wantedContractAddress])

  return (
    <Ethereum.Consumer>
      {(eth: EthereumContext) => (
        <div className="trade-display">
          <Grid container spacing={3}>
            <Grid item xs={5}>
              <TokenSelector
                side={TradeSide.Offer}
                provider={eth ? eth.provider : null}
                defaultValue={getItem("leftTokenRef")}
                setDefault={(v: any) => setItem("leftTokenRef", v)}
                setAddress={setOfferContractAddress}
                setID={setOfferID}
              />
            </Grid>
            <Grid className="make-offer-container" item xs={2}>
              <TradeButton
                offerContractAddress={offerContractAddress}
                offerTokenID={offerID}
                wantedContractAddress={wantedContractAddress}
                wantedTokenID={wantedID}
                side={side}
                eth={eth}
                showMakeOffer={setShowMakeOffer}
                showAcceptOffer={setShowAcceptOfferModal}
                /*provider={eth ? eth.provider : null}*/
              />
            </Grid>
            <Grid item xs={5}>
              <TokenSelector
                side={TradeSide.Wanted}
                provider={eth ? eth.provider : null}
                defaultValue={getItem("rightTokenRef")}
                setDefault={(v: any) => setItem("rightTokenRef", v)}
                setAddress={setWantedContractAddress}
                setID={setWantedID}
              />
            </Grid>
          </Grid>
          <Offer
            signer={eth ? eth.signer : null}
            letMeGetv1={eth ? eth.letMeGetv1 : null}
            open={showMakeOffer}
            close={() => setShowMakeOffer(false)}
            offerContract={offerContract}
            offerTokenID={offerID}
            wantedContract={wantedContract}
            wantedTokenID={wantedID}
          />
          {/*<AcceptOfferModal open={setShowAcceptOfferModal} />*/}
        </div>
      )}
    </Ethereum.Consumer>
  )
}

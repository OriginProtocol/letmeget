import React, { useEffect, useState, ReactElement } from "react"
import Grid from "@material-ui/core/Grid"
import { Provider, Log } from "@ethersproject/abstract-provider"
import { ethers, Contract } from "ethers"

import { Ethereum } from "../utils/context"
import { ERC721_ABI, EthereumContext } from "../utils/eth"
import hashOffer from "../utils/hashOffer"
import useLocalStorage from "../hooks/useLocalStorage"
import { TradeSide } from "../enums"
import { Offer as OfferInterface } from "../interfaces"
import TokenSelector from "./TokenSelector"
import TradeButton from "./TradeButton"
import OfferModal from "./Offer"
import AcceptOfferModal from "./AcceptOfferModal"

interface TradeDisplayProps {
  eth: EthereumContext
}

const MAX_HISTORY = 10000
const abiCoder = ethers.utils.defaultAbiCoder
const { getAddress } = ethers.utils

function parseOffer(evLog: Log): OfferInterface {
  const fullSig = evLog.topics[0]

  // Offer(address,address,address,uint256,uint256)
  if (
    fullSig !==
    "0x856df2f7c94d58b3881315ecac521eadd838e0f24cb792217529636fccf9040a"
  ) {
    return null
  }

  const [wantedOwner, wantedContractAddress, offerContractAddress] =
    evLog.topics.slice(1).map((addr) => abiCoder.decode(["address"], addr)[0])
  const [wantedTokenID, offerTokenID] = abiCoder.decode(
    ["uint256", "uint256"],
    evLog.data
  )

  return {
    offerContractAddress,
    offerTokenID: offerTokenID.toNumber(),
    wantedContractAddress,
    wantedTokenID: wantedTokenID.toNumber(),
    wantedOwner,
  }
}

export default function TradeDisplay(props?: TradeDisplayProps): ReactElement {
  const { eth } = props

  // App is initializing
  if (!eth) return null

  const { provider, signer, letMeGetv1 } = eth
  const [getItem, setItem] = useLocalStorage()
  const [offerContractAddress, setOfferContractAddress] = useState(null)
  const [offerContract, setOfferContract] = useState(null)
  const [offerID, setOfferID] = useState(null)
  const [wantedContractAddress, setWantedContractAddress] = useState(null)
  const [wantedContract, setWantedContract] = useState(null)
  const [wantedID, setWantedID] = useState(null)
  const [showMakeOffer, setShowMakeOffer] = useState(false)
  const [showAcceptOfferModal, setShowAcceptOfferModal] = useState(false)
  const [wants, setWants] = useState(null)
  const [side, setSide] = useState(TradeSide.Offer)
  const [tradeInvalid, setTradeInvalid] = useState(false)

  function firstOfferNotIgnored(wants: Array<OfferInterface>): OfferInterface {
    for (const offer of wants) {
      const offerHash = hashOffer(offer)
      const ignore = getItem(`${offerHash}:ignore`)
      if (!ignore) {
        return offer
      }
    }

    return null
  }

  function ignoreOffer(offer: OfferInterface) {
    const offerHash = hashOffer(offer)
    setItem(`${offerHash}:ignore`, "true")
  }

  async function getWants(address: string): Promise<Array<OfferInterface>> {
    const blockNumber = await provider.getBlockNumber()
    const filter = await letMeGetv1.filters.Offer(address, null, null)
    const logs = await provider.getLogs({
      fromBlock: blockNumber - MAX_HISTORY,
      ...filter,
    })

    return logs.map(parseOffer).filter((o) => !!o)
  }

  function clearTrade() {
    setItem("leftTokenRef", "")
    setItem("rightTokenRef", "")
    setOfferContract(null)
    setOfferContractAddress(null)
    setOfferID(null)
    setWantedContract(null)
    setWantedContractAddress(null)
    setWantedID(null)
  }

  useEffect(() => {
    if (wants) {
      const offer = firstOfferNotIgnored(wants)
      if (offer) {
        setSide(TradeSide.Wanted)
        setOfferContractAddress(offer.offerContractAddress)
        setOfferID(offer.offerTokenID)
        setWantedContractAddress(offer.wantedContractAddress)
        setWantedID(offer.wantedTokenID)
        /*setOfferContract(new Contract(offer.offerContractAddress, ERC721_ABI))
        setWantedContract(new Contract(offer.wantedContractAddress, ERC721_ABI))*/
      }
    } else {
      if (signer) {
        signer.getAddress().then((address: string) => {
          getWants(address).then(setWants)
        })
      } else {
        console.debug("Signer not available")
      }
    }
  }, [signer, provider, wants])

  useEffect(() => {
    if (offerContractAddress) {
      const ocontract = new Contract(
        offerContractAddress,
        ERC721_ABI,
        signer ? signer : provider
      )
      setOfferContract(ocontract)
      if (offerID) {
        const normalAccounts = eth.accounts.map((a) => getAddress(a))
        ocontract
          .ownerOf(offerID)
          .then((owner: string) => {
            if (normalAccounts.includes(owner)) {
              // Toggle if set invalid
              if (tradeInvalid) setTradeInvalid(false)
            } else {
              // Set invalid
              setTradeInvalid(true)
            }
          })
          .catch((err: Error) => {
            console.error("Error calling ownerOf() on offer contract")
            console.error(err)
          })
      }
    }
    if (wantedContractAddress) {
      const wcontract = new Contract(
        wantedContractAddress,
        ERC721_ABI,
        signer ? signer : provider
      )
      setWantedContract(wcontract)
    }
  }, [
    signer,
    offerContractAddress,
    offerID,
    wantedContractAddress,
    //wantedTokenID,
  ])

  return (
    <div className="trade-display">
      <Grid container spacing={3}>
        <Grid item xs={5}>
          <TokenSelector
            side={TradeSide.Offer}
            provider={eth ? eth.provider : null}
            defaultValue={
              offerContractAddress
                ? `${offerContractAddress}:${offerID}`
                : getItem("leftTokenRef")
            }
            setDefault={(v: string) => setItem("leftTokenRef", v)}
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
            invalid={tradeInvalid}
            showMakeOffer={setShowMakeOffer}
            showAcceptOffer={setShowAcceptOfferModal}
            /*provider={eth ? eth.provider : null}*/
          />
        </Grid>
        <Grid item xs={5}>
          <TokenSelector
            side={TradeSide.Wanted}
            provider={eth ? eth.provider : null}
            defaultValue={
              wantedContractAddress
                ? `${wantedContractAddress}:${wantedID}`
                : getItem("rightTokenRef")
            }
            setDefault={(v: string) => setItem("rightTokenRef", v)}
            setAddress={setWantedContractAddress}
            setID={setWantedID}
          />
        </Grid>
      </Grid>
      <OfferModal
        signer={eth ? eth.signer : null}
        letMeGetv1={eth ? eth.letMeGetv1 : null}
        open={showMakeOffer}
        close={() => setShowMakeOffer(false)}
        offerContract={offerContract}
        offerTokenID={offerID}
        wantedContract={wantedContract}
        wantedTokenID={wantedID}
        onSuccess={() => {
          setShowMakeOffer(false)
          clearTrade()
        }}
      />
      <AcceptOfferModal
        signer={eth ? eth.signer : null}
        letMeGetv1={eth ? eth.letMeGetv1 : null}
        open={showAcceptOfferModal}
        close={() => setShowAcceptOfferModal(false)}
        offerContract={offerContract}
        offerTokenID={offerID}
        wantedContract={wantedContract}
        wantedTokenID={wantedID}
        onSuccess={() => {
          ignoreOffer({
            offerContractAddress,
            offerTokenID: offerID,
            wantedContractAddress,
            wantedTokenID: wantedID,
          })
          setShowAcceptOfferModal(false)
          clearTrade()
        }}
      />
    </div>
  )
}

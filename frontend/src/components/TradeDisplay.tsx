import React, { useEffect, useState, ReactElement } from "react"
import Grid from "@material-ui/core/Grid"
import { Provider, Log } from "@ethersproject/abstract-provider"
import { Signer } from "@ethersproject/abstract-signer"
import { ethers } from "ethers"

import { EthereumContext, initERC721 } from "../utils/eth"
import hashOffer from "../utils/hashOffer"
import useLocalStorage from "../hooks/useLocalStorage"
import { TradeSide } from "../enums"
import { Offer as OfferInterface, Trade as TradeInterface } from "../interfaces"
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
  const [trade, setTrade] = useState(null)

  const [showMakeOffer, setShowMakeOffer] = useState(false)
  const [showAcceptOfferModal, setShowAcceptOfferModal] = useState(false)
  const [wants, setWants] = useState(null)

  const signerOrProvider: Signer | Provider = eth
    ? signer
      ? signer
      : provider
    : null

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

  function ignoreOffer(trade: TradeInterface) {
    if (!trade.offerTokenID || !trade.wantedTokenID) return
    const offer = {
      offerContractAddress: trade.offerContract.address,
      offerTokenID: trade.offerTokenID,
      wantedContractAddress: trade.wantedContract.address,
      wantedTokenID: trade.wantedTokenID,
    }
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
    console.debug("clearTrade()")
    setItem("leftTokenRef", "")
    setItem("rightTokenRef", "")
    setTrade(null)
  }

  useEffect(() => {
    if (wants) {
      const offer = firstOfferNotIgnored(wants)
      if (offer) {
        setTrade({
          side: TradeSide.Wanted,
          offerContract: initERC721(
            offer.offerContractAddress,
            signerOrProvider
          ),
          offerTokenID: offer.offerTokenID,
          wantedContract: initERC721(
            offer.wantedContractAddress,
            signerOrProvider
          ),
          wantedTokenID: offer.wantedTokenID,
          valid: true,
        })
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
    if (trade && trade.side === TradeSide.Offer && trade.offerTokenID) {
      const normalAccounts = eth.accounts.map((a) => getAddress(a))
      trade.offerContract
        .ownerOf(trade.offerTokenID)
        .then((owner: string) => {
          if (normalAccounts.includes(owner)) {
            // Toggle if set invalid
            if (!trade.valid) {
              setTrade({
                ...trade,
                valid: true,
              })
            }
          } else {
            // Set invalid
            setTrade({
              ...trade,
              valid: false,
            })
          }
        })
        .catch((err: Error) => {
          console.error("Error calling ownerOf() on offer contract")
          console.error(err)
        })
    }
  }, [trade])

  return (
    <div className="trade-display">
      <Grid container spacing={3}>
        <Grid item xs={5}>
          <TokenSelector
            side={TradeSide.Offer}
            provider={eth ? eth.provider : null}
            defaultValue={
              trade && trade.offerContract
                ? `${trade.offerContract.address}:${trade.offerTokenID}`
                : getItem("leftTokenRef")
            }
            setDefault={(v: string) => setItem("leftTokenRef", v)}
            setAddress={(addr) => {
              setTrade({
                ...trade,
                offerContract: addr ? initERC721(addr, signerOrProvider) : null,
              })
            }}
            setID={(offerTokenID) => {
              setTrade({
                ...trade,
                offerTokenID,
              })
            }}
          />
        </Grid>
        <Grid className="make-offer-container" item xs={2}>
          <TradeButton
            trade={trade}
            eth={eth}
            showMakeOffer={setShowMakeOffer}
            showAcceptOffer={setShowAcceptOfferModal}
          />
        </Grid>
        <Grid item xs={5}>
          <TokenSelector
            side={TradeSide.Wanted}
            provider={eth ? eth.provider : null}
            defaultValue={
              trade && trade.wantedContract
                ? `${trade.wantedContract.address}:${trade.wantedTokenID}`
                : getItem("rightTokenRef")
            }
            setDefault={(v: string) => setItem("rightTokenRef", v)}
            setAddress={(addr) => {
              setTrade({
                ...trade,
                wantedContract: addr
                  ? initERC721(addr, signerOrProvider)
                  : null,
              })
            }}
            setID={(wantedTokenID) => {
              setTrade({
                ...trade,
                wantedTokenID,
              })
            }}
          />
        </Grid>
      </Grid>
      {trade ? (
        <>
          <OfferModal
            signer={eth ? eth.signer : null}
            letMeGetv1={eth ? eth.letMeGetv1 : null}
            open={showMakeOffer}
            close={() => setShowMakeOffer(false)}
            trade={trade}
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
            trade={trade}
            onSuccess={() => {
              ignoreOffer(trade)
              setShowAcceptOfferModal(false)
              clearTrade()
            }}
          />
        </>
      ) : null}
    </div>
  )
}

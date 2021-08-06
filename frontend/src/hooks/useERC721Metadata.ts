import { ethers } from "ethers"
import { Provider } from "@ethersproject/abstract-provider"
import { ChangeEvent, ChangeEventHandler, useState, useEffect } from "react"

import { NFTArtProps } from "../components/NFTArt"
import { ERC721_ABI } from "../utils/eth"
import { translateIPFSURI, translateIPFSMetadata } from "../utils/ipfs"

interface ERC721HookReturn {
  tokenMeta?: NFTArtProps
  tokenAddress?: string
  tokenID?: number
  setTokenReference: (ref: string) => void
  error: string
}

const DEFAULT_ERC721_META: NFTArtProps = {
  name: "",
  description: "",
  external_url: "",
  image: "/static/images/defaultImage.png",
  animation_url: null,
  youtube_url: null,
  attributes: [],
  background_color: null,
}

// Match OpenSea token URLs: https://opensea.io/assets/0x99b9791d1580bf504a1709d310923a46237c8f2c/808
const OPENSEA_PATTERN =
  /^https?:\/\/(www\.)?opensea\.io\/assets\/(0x[A-Fa-f0-9]{40})\/([0-9]+)\/?$/
// Match rarible URLs: https://rarible.com/token/0x99b9791d1580bf504a1709d310923a46237c8f2c:1168
const RARIBLE_PATTERN =
  /^https?:\/\/(www\.)?rarible\.com\/token\/(0x[A-Fa-f0-9]{40}):([0-9]+)/
// Attempt to match generally
const BASIC_PATTERN = /(0x[A-Fa-f0-9]{40})[:/]{1}([0-9]+)$/

function parseRef(tokenRef: string): [string, number] {
  const parts = tokenRef.match(BASIC_PATTERN)

  if (parts) {
    return [parts[1], parts[2] ? parseInt(parts[2]) : null]
  }

  throw new Error(`Unknown token ref: ${tokenRef}`)
}

async function loadMeta(provider: Provider, address: string, tokenID: number) {
  const contract = new ethers.Contract(address, ERC721_ABI, provider)

  let tokenURI = await contract.tokenURI(tokenID)

  if (!tokenURI) {
    console.warn(`No Token URI for ref ${address}:${tokenID}`)
    return null
  }

  // Translate IPFS URIs
  if (tokenURI.includes("ipfs")) {
    tokenURI = translateIPFSURI(tokenURI)
  }

  console.log(`Fetching metadata for ${address}:${tokenID} from ${tokenURI}`)

  const resp = await fetch(tokenURI, {
    headers: {
      Accept: "application/json",
    },
  })

  if (!resp.ok) {
    throw new Error(`Unable to fetch token metadata from ${tokenURI}`)
  }

  return translateIPFSMetadata(await resp.json())
}

export default function useERC721Metadata(
  provider: Provider,
  defaults: NFTArtProps = {}
): ERC721HookReturn {
  const [tokenRef, setTokenRef] = useState(null)
  const [tokenAddress, setTokenAddress] = useState(null)
  const [tokenID, setTokenID] = useState(null)
  const [error, setError] = useState(null)
  const [tokenMeta, setTokenMeta] = useState({
    ...DEFAULT_ERC721_META,
    ...defaults,
  })

  function setTokenReference(ref: string): void {
    console.log("setTokenReference()", ref)
    setTokenRef(ref)
  }

  useEffect(() => {
    if (provider && tokenRef) {
      console.log("parseRef-")
      const [address, id] = parseRef(tokenRef)
      console.log("-parseRef", address, id)
      setTokenAddress(address)
      setTokenID(id)
      loadMeta(provider, address, id)
        .then((meta: NFTArtProps) => setTokenMeta(meta))
        .catch((err) => setError(err.toString()))
    }
  }, [provider, tokenRef])

  return { tokenAddress, tokenID, tokenMeta, setTokenReference, error }
}

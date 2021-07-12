import { ethers } from "ethers"
import { Provider } from "@ethersproject/abstract-provider"
import { ChangeEvent, ChangeEventHandler, useState, useEffect } from "react"

import { NFTArtProps } from "../components/NFTArt"
import { ERC721_ABI } from "../utils/eth"
import { translateIPFSURI, translateIPFSMetadata } from "../utils/ipfs"

interface ERC721HookReturn {
  tokenMeta?: NFTArtProps
  setTokenReference: ChangeEventHandler
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

function parseRef(tokenRef: string) {
  const parts = tokenRef.match(BASIC_PATTERN)
  console.log("parts:", parts)
  if (parts) {
    return [parts[1], parts[2]]
  }
  /*if (tokenRef.includes("opensea.io")) {
    if (!parts) {
      throw new Error("Invalid OpenSea token URI")
    }
    return [parts[2], parts[3]]
  } else if (tokenRef.includes("rarible.com")) {
    const parts = tokenRef.match(RARIBLE_PATTERN)
    if (!parts) {
      throw new Error("Invalid Rarible token URI")
    }
    return [parts[2], parts[3]]
  } else if (tokenRef.match(BASIC_PATTERN)) {
    const parts = tokenRef.match(BASIC_PATTERN)
    return [parts[2], parts[3]]
  }*/

  throw new Error("Unknown token URI")
}

async function loadMetaFromRef(provider: Provider, tokenRef: string) {
  console.log("loadMetaFromRef()", provider, tokenRef)
  const [address, tokenId] = parseRef(tokenRef)
  console.log("DEBUGDEBUGDEBUGDEBUGDEBUG")
  console.log("token:", address, tokenId)
  const contract = new ethers.Contract(address, ERC721_ABI, provider)

  console.debug(`tokenURI(${tokenId})`)
  console.debug(`contract:`, contract)

  let tokenURI = await contract.tokenURI(tokenId)
  //.catch((err: Error) => console.error(err))
  //const tokenURI = await contract.functions.tokenURI(tokenId)
  console.log("-DEBUGDEBUGDEBUGDEBUGDEBUG")

  if (!tokenURI) {
    console.warn(`No Token URI for ref ${tokenRef}`)
    return null
  }

  // Translate IPFS URIs
  console.log("tokenURI:", typeof tokenURI, tokenURI)
  if (tokenURI.includes("ipfs")) {
    tokenURI = translateIPFSURI(tokenURI)
  }

  console.log(`Fetching metadata for ${address}:${tokenId} from ${tokenURI}`)

  // TODO: Review the no-cors mode here
  const resp = await fetch(tokenURI, {
    // mode: "no-cors"
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
  const [error, setError] = useState(null)
  const [tokenMeta, setTokenMeta] = useState({
    ...DEFAULT_ERC721_META,
    ...defaults,
  })

  function setTokenReference(ev: ChangeEvent<HTMLInputElement>): void {
    console.log("setTokenReference()", ev.target.value)
    setTokenRef(ev.target.value)
  }

  useEffect(() => {
    if (provider && tokenRef) {
      loadMetaFromRef(provider, tokenRef)
        .then((meta: NFTArtProps) => setTokenMeta(meta))
        .catch((err) => setError(err.toString()))
    }
  }, [provider, tokenRef])

  return { tokenMeta, setTokenReference, error }
}

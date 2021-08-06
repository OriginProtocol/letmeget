import { ethers, ContractInterface, Contract } from "ethers"
import { Provider } from "@ethersproject/abstract-provider"
import { Signer } from "@ethersproject/abstract-signer"
import { KeyValue } from "../interfaces.d"

interface Artifact {
  [key: string]: any
}

interface Artifacts {
  [key: string]: Artifact
}

export interface EthereumContext {
  artifacts: Artifacts
  provider: Provider
  signer?: Signer
  accounts: Array<string>
  letMeGetv1?: Contract
  success: boolean
  error: string
}

export interface Providers {
  [networkId: string]: EthereumContext
}

interface StringKV {
  [key: string]: string
}

interface ContractNames {
  [key: string]: string[]
}

const LOCAL_NODE_ENDPOINT = "http://localhost:8545"

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"
export const DEFAULT_NETWORK = "1"
export const NETWORKS: KeyValue = {
  "1": "mainnet",
  "1337": "ganache",
}

export const CONTRACT_NAMES: ContractNames = {
  "1": ["LetMeGet_v1"],
  "1337": ["LetMeGet_v1", "ApesMock", "RatsMock"],
}

// TODO: Load from metafile?
/*export let CONTRACTS: StringKV = {
  "1": null,
  "1337": loadArtifacts,
}

export const NET_BY_CONTRACT: StringKV = Object.keys(CONTRACTS).reduce(
  (acc: StringKV, cur: string) => {
    acc[CONTRACTS[cur]] = cur
    return acc
  },
  {}
)*/

export const ERC721_ABI: Array<KeyValue> = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "approved",
        type: "address",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "Approval",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "operator",
        type: "address",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "approved",
        type: "bool",
      },
    ],
    name: "ApprovalForAll",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "Transfer",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "approve",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "balanceOf",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "getApproved",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "address",
        name: "operator",
        type: "address",
      },
    ],
    name: "isApprovedForAll",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "name",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "ownerOf",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "safeTransferFrom",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "_data",
        type: "bytes",
      },
    ],
    name: "safeTransferFrom",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "operator",
        type: "address",
      },
      {
        internalType: "bool",
        name: "approved",
        type: "bool",
      },
    ],
    name: "setApprovalForAll",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes4",
        name: "interfaceId",
        type: "bytes4",
      },
    ],
    name: "supportsInterface",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "tokenURI",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "transferFrom",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
]

/*export const LETMEGETV1_ABI: Array<KeyValue> = [
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "wanted_owner", type: "address" },
      { indexed: true, name: "wanted_contract", type: "address" },
      { indexed: true, name: "offer_contract", type: "address" },
      { indexed: false, name: "wanted_token_id", type: "uint256" },
      { indexed: false, name: "offer_token_id", type: "uint256" },
    ],
    name: "Offer",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "offer_owner", type: "address" },
      { indexed: true, name: "wanted_contract", type: "address" },
      { indexed: true, name: "offer_contract", type: "address" },
      { indexed: false, name: "wanted_token_id", type: "uint256" },
      { indexed: false, name: "offer_token_id", type: "uint256" },
    ],
    name: "Accept",
    type: "event",
  },
  {
    gas: 2541,
    inputs: [
      { name: "offer_contract", type: "address" },
      { name: "offer_token_id", type: "uint256" },
      { name: "wanted_contract", type: "address" },
      { name: "wanted_token_id", type: "uint256" },
    ],
    name: "offer_can_complete",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    gas: 28706,
    inputs: [
      { name: "offer_contract", type: "address" },
      { name: "offer_token_id", type: "uint256" },
      { name: "wanted_contract", type: "address" },
      { name: "wanted_token_id", type: "uint256" },
      { name: "signature", type: "bytes" },
    ],
    name: "signer",
    outputs: [
      { name: "", type: "address" },
      { name: "", type: "bytes32" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    gas: 126998,
    inputs: [
      { name: "offer_contract", type: "address" },
      { name: "offer_token_id", type: "uint256" },
      { name: "wanted_contract", type: "address" },
      { name: "wanted_token_id", type: "uint256" },
      { name: "signature", type: "bytes" },
    ],
    name: "offer",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    gas: 115367,
    inputs: [
      { name: "offer_contract", type: "address" },
      { name: "offer_token_id", type: "uint256" },
      { name: "wanted_contract", type: "address" },
      { name: "wanted_token_id", type: "uint256" },
      { name: "signature", type: "bytes" },
    ],
    name: "accept",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
]*/

export const VALUES: KeyValue = {
  oneEther: ethers.BigNumber.from("1000000000000000000"),
}

const _cachedProvider: Providers = {}
let _localNodeSeen: boolean = null

async function httpGetBlock(endpoint: string): Promise<KeyValue> {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: 123,
      method: "eth_blockNumber",
      params: [],
    }),
  })

  if (!res.ok) {
    throw new Error("Request failed!")
  }

  return await res.json()
}

async function localNodeAvailable(): Promise<boolean> {
  if (_localNodeSeen !== null) return _localNodeSeen
  try {
    await httpGetBlock(LOCAL_NODE_ENDPOINT)
    _localNodeSeen = true
  } catch {
    _localNodeSeen = false
  }
  return _localNodeSeen
}

async function loadArtifacts(chainId: number): Promise<Artifacts> {
  const facts: Artifacts = {}
  for (const name of CONTRACT_NAMES[chainId.toString()]) {
    facts[name] = await import(`../artifacts/${chainId}/${name}.json`)
  }
  return facts
}

// TODO: Leverage caching, and double check network
export async function getProvider(
  networkId?: string
): Promise<EthereumContext> {
  if (networkId && typeof _cachedProvider[networkId] !== "undefined") {
    console.debug("Returning cached provider")
    return _cachedProvider[networkId]
  }

  const networkIdNumber = networkId ? parseInt(networkId) : null
  let accounts: Array<string> = []
  let provider: ethers.providers.JsonRpcProvider

  if (window.ethereum) {
    console.debug("Using in-browser provider")
    window.ethereum.sendAsync(
      { method: "net_version", params: [] },
      (err: Error, v: string) => console.log("net_version", err, v)
    )
    provider = new ethers.providers.Web3Provider(window.ethereum)
    /*if (window.ethereum.isMetaMask) {
      window.ethereum.request({ method: 'eth_requestAccounts' })
    }*/
  } else {
    if (await localNodeAvailable()) {
      console.debug("Connecting to local node")
      provider = new ethers.providers.JsonRpcProvider(LOCAL_NODE_ENDPOINT)
    } else {
      // TODO:
      console.debug("Attempting to conncet to default provider")
      provider = ethers.getDefaultProvider(
        networkId
      ) as ethers.providers.JsonRpcProvider
    }
  }

  const signer = await provider.getSigner()

  // Check network
  const network = await provider.getNetwork()

  let chainId: number = network.chainId

  // Mostly to deal with ganache and weird networks/clients
  if (chainId > 1000) {
    const netVersionRes = await provider.send("net_version", [])
    if (netVersionRes !== chainId) {
      chainId = parseInt(netVersionRes)
    }
  }

  const artifacts: Artifacts = await loadArtifacts(chainId)

  // Only mismatch error if a network is given/selected
  if (networkIdNumber && chainId !== networkIdNumber) {
    console.debug("Network mismatch", chainId, networkIdNumber)
    return {
      artifacts,
      provider,
      accounts: [],
      success: false,
      error: `Invalid network. Node is connected to ${chainId}, we want ${networkId}`,
    }
  } else {
    // Use connected chain ID as our current network
    networkId = chainId.toString()
  }

  // Get our accounts
  if (window.ethereum.isMetaMask) {
    accounts = await window.ethereum.request({ method: "eth_requestAccounts" })
  } else {
    // TODO: Does ethers.js not support eth_accounts?
    accounts.push((await signer.getAddress()) as string)
  }

  // Contracts
  const lmgAddress: string = artifacts?.LetMeGet_v1?.deployment?.address
  const lmgABI: ContractInterface = artifacts?.LetMeGet_v1?.abi
  const letMeGetv1: Contract = lmgAddress
    ? new Contract(lmgAddress, lmgABI, signer)
    : null

  console.debug("LetMeGetV1:", letMeGetv1)

  _cachedProvider[networkId] = {
    artifacts,
    provider,
    signer,
    accounts,
    letMeGetv1,
    success: true,
    error: null,
  }
  console.debug("Created new provider")
  return _cachedProvider[networkId]
}

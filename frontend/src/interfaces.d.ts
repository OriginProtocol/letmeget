import { Contract } from "ethers"

import { TradeSide } from "./enums"

declare global {
  interface Window {
    ethereum: any
  }
}

export interface KeyValue {
  [key: string]: any
}

export interface Offer {
  offerContractAddress: string
  offerTokenID: number
  wantedContractAddress: string
  wantedTokenID: number
  expires?: number
  wantedOwner?: string
}

export interface Trade extends Offer {
  side: TradeSide
  offerContract: Contract
  offerTokenID: number
  wantedContract: Contract
  wantedTokenID: number
  expires: number
  valid: boolean
}

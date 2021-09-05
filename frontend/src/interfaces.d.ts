import { Contract, BigNumber } from "ethers"

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
  offerTokenID: string | BigNumber
  wantedContractAddress: string
  wantedTokenID: string | BigNumber
  expires?: number
  wantedOwner?: string
}

export interface Trade extends Offer {
  side: TradeSide
  offerContract: Contract
  offerTokenID: string | BigNumber
  wantedContract: Contract
  wantedTokenID: string | BigNumber
  expires: number
  valid: boolean
}

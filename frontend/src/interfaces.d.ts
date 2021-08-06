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
  wantedOwner?: string
}

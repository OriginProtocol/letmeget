declare global {
  interface Window {
    ethereum: any
  }
}

export interface KeyValue {
  [key: string]: any
}

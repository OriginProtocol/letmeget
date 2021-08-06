import { utils } from "ethers"

import { Offer } from "../interfaces"

const { hexConcat, keccak256, zeroPad } = utils

function add0xPrefix(v: string): string {
  return v.startsWith("0x") ? v : `0x${v}`
}

function numberToHex(n: number): string {
  const v = n.toString(16)
  return add0xPrefix(`${v.length % 2 !== 0 ? "0" : ""}${v}`)
}

export default function hashOffer(offer: Offer): string {
  const {
    offerContractAddress,
    offerTokenID,
    wantedContractAddress,
    wantedTokenID,
  } = offer
  const oa = zeroPad(offerContractAddress, 32)
  const oid = zeroPad(numberToHex(offerTokenID), 32)
  const wa = zeroPad(wantedContractAddress, 32)
  const wid = zeroPad(numberToHex(wantedTokenID), 32)
  const packed = hexConcat([oa, oid, wa, wid])
  const hash = keccak256(packed)

  return hash
}

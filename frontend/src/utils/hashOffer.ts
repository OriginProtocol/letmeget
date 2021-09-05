import { utils, BigNumber } from "ethers"

import { Offer } from "../interfaces"

const { hexConcat, keccak256, zeroPad } = utils

function add0xPrefix(v: string): string {
  return v.startsWith("0x") ? v : `0x${v}`
}

function numberToHex(n: string | BigNumber): string {
  if (typeof n === "string") {
    n = BigNumber.from(n)
  }
  return n.toHexString()
}

export default function hashOffer(offer: Offer): string {
  console.log("offer:", offer)
  const {
    offerContractAddress,
    offerTokenID,
    wantedContractAddress,
    wantedTokenID,
    expires,
  } = offer
  const oa = zeroPad(offerContractAddress, 32)
  const oid = zeroPad(numberToHex(offerTokenID), 32)
  const wa = zeroPad(wantedContractAddress, 32)
  const wid = zeroPad(numberToHex(wantedTokenID), 32)
  const exp = zeroPad(numberToHex(BigNumber.from(expires)), 32)
  const packed = hexConcat([oa, oid, wa, wid, exp])
  const hash = keccak256(packed)

  return hash
}

import { utils } from "ethers"

const { hexConcat, keccak256, zeroPad } = utils

function add0xPrefix(v: string): string {
  return v.startsWith("0x") ? v : `0x${v}`
}

function numberToHex(n: number): string {
  const v = n.toString(16)
  return add0xPrefix(`${v.length % 2 !== 0 ? "0" : ""}${v}`)
}

export default function hashOffer(
  offerContractAddress: string,
  offerTokenID: number,
  wantedContractAddress: string,
  wantedTokenID: number
): string {
  console.log(
    "hashOffer()",
    offerContractAddress,
    offerTokenID,
    wantedContractAddress,
    wantedTokenID
  )
  const oa = zeroPad(offerContractAddress, 32)
  console.log("oa:", oa)
  console.log("offerTokenID:", offerTokenID, numberToHex(offerTokenID))
  const oid = zeroPad(numberToHex(offerTokenID), 32)
  console.log("oid:", oid)
  const wa = zeroPad(wantedContractAddress, 32)
  console.log("wa:", wa)
  const wid = zeroPad(numberToHex(wantedTokenID), 32)
  console.log("wid:", wid)
  const packed = hexConcat([oa, oid, wa, wid])
  console.log("packed:", packed)
  const hash = keccak256(packed)
  console.log("hash:", hash)
  return hash
}

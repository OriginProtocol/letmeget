import trimStart from "lodash/trimStart"
import { KeyValue } from "../interfaces.d"

const IPFS_METADATA_KEYS = ["image", "animation_url", "youtube_url"]
const IPFS_CID_PATTERN =
  /(Qm[1-9A-HJ-NP-Za-km-z]{44,}|b[A-Za-z2-7]{58,}|B[A-Z2-7]{58,}|z[1-9A-HJ-NP-Za-km-z]{48,}|F[0-9A-F]{50,})/

// Shrug
export const IPFS_GATEWAY_ROOT = "https://cloudflare-ipfs.com/ipfs"

export function translateIPFSURI(uri: string): string {
  if (!uri.startsWith("http") && uri.match(IPFS_CID_PATTERN)) {
    const url = new URL(uri)

    const webURI = `${IPFS_GATEWAY_ROOT}/${trimStart(
      url.hostname,
      "/"
    )}/${trimStart(url.pathname, "/")}`

    return webURI
  }

  return uri
}

export function translateIPFSMetadata(metadata: KeyValue): KeyValue {
  return Object.keys(metadata).reduce((acc: KeyValue, key: string) => {
    if (IPFS_METADATA_KEYS.includes(key) && metadata[key].includes("ipfs")) {
      metadata[key] = translateIPFSURI(metadata[key])
    }

    return metadata
  }, {} as KeyValue)
}

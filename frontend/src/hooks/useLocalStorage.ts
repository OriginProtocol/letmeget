import { useState, useEffect } from "react"

export default function useLocalStorage(): [
  (k: string) => string,
  (k: string, v: any) => void
] {
  let memVal = null

  function setVal(k: string, v: any) {
    return localStorage.setItem(k, v)
  }

  function getVal(k: string): string {
    return localStorage.getItem(k)
  }

  return [getVal, setVal]
}

import React from "react"
import { render } from "react-dom"

import App from "./App"

const SSL_ENFORCE_HOSTNAMES = [
  "letmeget.io",
  "www.letmeget.io",
  "letmeget.app",
  "www.letmeget.app",
  "letmeget.org",
  "www.letmeget.org",
]
if (
  location.protocol !== "https" &&
  SSL_ENFORCE_HOSTNAMES.includes(location.hostname)
) {
  location.href = `https://letmeget.io${location.pathname}`
}

render(<App />, document.getElementById("root"))

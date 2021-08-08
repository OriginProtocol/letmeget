import React, { ChangeEvent, ReactElement } from "react"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { Container, CssBaseline, ThemeProvider } from "@material-ui/core"
import { createTheme } from "@material-ui/core/styles"
import Alert from "@material-ui/lab/Alert"

import TradeDisplay from "./components/TradeDisplay"
import Footer from "./components/Footer"
import NetworkAlert from "./components/NetworkAlert"

import { Ethereum } from "./utils/context"
import { NETWORKS, EthereumContext, getProvider } from "./utils/eth"
import { KeyValue } from "./interfaces"

import "./App.scss"
import RubikRegularTTF from "./static/fonts/Rubik-Regular.ttf"

const LOCAL_STORAGE_NETWORK = "ethnetwork"

class App extends React.Component {
  state: KeyValue

  constructor(props = {}) {
    super(props)

    const storedNetwork = localStorage.getItem(LOCAL_STORAGE_NETWORK)
    const network = storedNetwork ? storedNetwork : null

    this.state = {
      network,
      theme: createTheme({
        typography: {
          fontFamily: "Rubik-Regular, sans-serif",
        },
        overrides: {
          MuiCssBaseline: {
            "@global": {
              "@font-face": [
                {
                  fontFamily: "Rubik-Regular",
                  fontStyle: "normal",
                  fontDisplay: "swap",
                  fontWeight: 400,
                  src: `
                  local('Rubik'),
                  local('Rubik-Regular'),
                  url(${RubikRegularTTF}) format('truetype')
                `,
                },
              ],
            },
          },
        },
      }),
      //contract,
    }

    this.initEthContext(network)

    this.changeNetwork = this.changeNetwork.bind(this)
    this.switchNetwork = this.switchNetwork.bind(this)
    this.switchAccounts = this.switchAccounts.bind(this)

    if (window.ethereum) {
      /*window.ethereum.on("accountsChanged", this.switchAccounts)
      window.ethereum.on("networkChanged", this.switchNetwork)*/
      // TODO: Lazy method of clearing state and reloading wants
      window.ethereum.on("accountsChanged", () => {
        location.reload()
      })
      window.ethereum.on("networkChanged", () => {
        location.reload()
      })
    }
  }

  async initEthContext(network?: string): Promise<void> {
    const ethContext = await getProvider(network)
    this.setState({ ethContext })
  }

  changeNetwork(ev: ChangeEvent<HTMLInputElement>): void {
    console.debug(`changeNetwork to ${ev.target.value}`)
    const network = ev.target.value
    this.switchNetwork(network)
  }

  switchNetwork(networkId?: string): void {
    console.debug(`switchNetwork to ${networkId}`)
    if (!(networkId in NETWORKS)) {
      throw new Error("Invalid network")
    }

    localStorage.setItem(LOCAL_STORAGE_NETWORK, networkId)

    this.setState({
      network: networkId,
    })

    this.initEthContext(networkId)
  }

  switchAccounts(): void {
    console.debug(`switchAccounts`)
    this.initEthContext(this.state.network)
  }

  handleError(err: Error): void {
    console.error(err)
    toast.error(err.message)
  }

  handleWarning(msg: string): void {
    console.warn(msg)
    toast.warn(msg)
  }

  render(): ReactElement {
    return (
      <Ethereum.Provider value={this.state.ethContext}>
        <ThemeProvider theme={this.state.theme}>
          <Container className="app-container">
            <CssBaseline />
            <header className="header">
              <h1 className="brand">
                <img src="/static/images/heart.png" />
                Let Me Get
              </h1>
              <NetworkAlert />
            </header>

            <div className="header-pad" />

            {/* TODO: Move consumer out of here by creating another component? */}
            <Ethereum.Consumer>
              {(eth: EthereumContext) => (
                <>
                  {eth && eth.error ? (
                    <Alert severity="error">{eth.error}</Alert>
                  ) : (
                    <TradeDisplay eth={eth} />
                  )}
                  <div className="header-pad" />
                  <Footer eth={eth} />
                </>
              )}
            </Ethereum.Consumer>

            <ToastContainer
              position="bottom-right"
              newestOnTop={true}
              autoClose={15000}
            />
          </Container>
        </ThemeProvider>
      </Ethereum.Provider>
    )
  }
}

export default App

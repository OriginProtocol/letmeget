import React, { ChangeEvent, ReactElement } from "react"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { Container, CssBaseline, ThemeProvider } from "@material-ui/core"
import { createTheme } from "@material-ui/core/styles"
import Alert from "@material-ui/lab/Alert"

import TradeDisplay from "./components/TradeDisplay"

import { Ethereum } from "./utils/context"
import { NETWORKS, EthereumContext, getProvider } from "./utils/eth"
import { KeyValue } from "./interfaces"

import "./App.scss"
import RubikRegularTTF from "./static/fonts/Rubik-Regular.ttf"

const LOCAL_STORAGE_NETWORK = "ethnetwork"

class App extends React.Component {
  state: KeyValue

  constructor() {
    super({})

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
  }

  async initEthContext(network: string): Promise<void> {
    const ethContext = await getProvider(network)
    this.setState({ ethContext })
  }

  changeNetwork(ev: ChangeEvent<HTMLInputElement>): void {
    console.log(`changeNetwork to ${ev.target.value}`)
    const network = ev.target.value

    if (!(network in NETWORKS)) {
      throw new Error("Invalid network")
    }

    //const contract = network in CONTRACTS ? CONTRACTS[network] : CONTRACTS['1']

    localStorage.setItem(LOCAL_STORAGE_NETWORK, network)

    this.setState({
      network,
      //contract
    })

    this.initEthContext(network)
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
            </header>
            {/*<MyAccount />*/}

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

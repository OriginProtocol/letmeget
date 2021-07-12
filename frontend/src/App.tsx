import React, { ChangeEvent, ReactElement } from 'react'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Container, CssBaseline, ThemeProvider } from '@material-ui/core'
import { createTheme } from '@material-ui/core/styles'

import Header from './components/Header'
import TradeDisplay from './components/TradeDisplay'

import { Ethereum } from './utils/context'
import { DEFAULT_NETWORK, NETWORKS, getProvider } from './utils/eth'
import { KeyValue } from './interfaces'

import './App.scss'
import RubikRegularTTF from './static/fonts/Rubik-Regular.ttf';

const LOCAL_STORAGE_NETWORK = 'ethnetwork'

interface NoProps {}

class App extends React.Component {
  state: KeyValue

  constructor(props?: NoProps) {
    super(props)

    const storedNetwork = localStorage.getItem(LOCAL_STORAGE_NETWORK)
    const network = storedNetwork ? storedNetwork : DEFAULT_NETWORK
    //const contract = network in CONTRACTS ? CONTRACTS[network] : CONTRACTS['1']

    this.state = {
      network,
      theme: createTheme({
        typography: {
          fontFamily: 'Rubik-Regular, sans-serif',
        },
        overrides: {
          MuiCssBaseline: {
            '@global': {
              '@font-face': [{
                fontFamily: 'Rubik-Regular',
                fontStyle: 'normal',
                fontDisplay: 'swap',
                fontWeight: 400,
                src: `
                  local('Rubik'),
                  local('Rubik-Regular'),
                  url(${RubikRegularTTF}) format('truetype')
                `,
              }],
            },
          },
        },
      })
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
      throw new Error('Invalid network')
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
            {process.env.NODE_ENV !== 'production' ?
              (
                <Header
                  network={this.state.network}
                  onNetworkChange={this.changeNetwork}
                />
              ) : null}
            <div className="header-pad" />
            <TradeDisplay />
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

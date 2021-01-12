import React from 'react'
import Head from 'next/head'
import App from 'next/app'
import { GatewayPool } from 'dvote-js'

import AppContext, { IAppContext } from '../lib/app-context'
// import MainLayout from '../components/layout'
// import GeneralError from '../components/error'
// import { initNetwork, getNetworkState } from '../lib/network'
// import { IAppContext } from '../components/app-context'
// import { isServer } from '../lib/util'

import '../styles/index.less'
import Header from '../components/header'
import Footer from '../components/footer'
import { getWeb3 } from '../lib/web3'
import { getPool } from '../lib/vochain'
// import IndexPage from '.'

type Props = {
    managerBackendGateway: GatewayPool
}

type State = {
    // STATE SHARED WITH CHILDREN
    entityId?: string
    processId?: string
    urlHash?: string
    connectionError?: string
    managerBackendGateway?: GatewayPool
}

class MainApp extends App<Props, State> {
    state: State = {
        entityId: '',
        processId: '',
        urlHash: '',
    }

    componentDidMount(): void {
        // this.connect()

        // window.addEventListener('beforeunload', this.beforeUnload)

        this.hashChange = this.hashChange.bind(this)
        window.addEventListener('hashchange', this.hashChange)
    }

    componentWillUnmount(): void {
        // window.removeEventListener('beforeunload', this.beforeUnload)
        window.removeEventListener('hashchange', this.hashChange)
    }

    // beforeUnload(e: BeforeUnloadEvent): void {
    //     if (!getNetworkState().readOnly) {
    //         // Cancel the event
    //         e.preventDefault() // If you prevent default behavior in Mozilla Firefox prompt will always be shown
    //         // Chrome requires returnValue to be set
    //         e.returnValue = ''
    //     }
    // }

    // async connect(): Promise<void> {
    //     await initNetwork().then(async () => {
    //         message.success("Connected")
    //         this.setState({ connectionError: null })
    //         this.refreshWeb3Status()
    //     }).catch(err => {
    //         message.error("Could not connect")
    //         this.setState({ connectionError: err && err.message || err })
    //         this.refreshWeb3Status()
    //     })

    //     const managerBackendGateway: DVoteGateway = new DVoteGateway({
    //         uri: process.env.MANAGER_BACKEND_URI,
    //         supportedApis: ['census'],
    //         publicKey: process.env.MANAGER_BACKEND_PUB_KEY,
    //     })
    //     this.setState({ managerBackendGateway })
    // }

    hashChange(e: HashChangeEvent) {
        this.setUrlHash(location.hash.substr(2))
    }

    // useNewWallet(newWallet: Wallet) {
    //     getWeb3Wallet().setWallet(newWallet)
    //     initNetwork().then(async () => {
    //         message.success("Connected")
    //         return this.refreshWeb3Status()
    //     }).then(() => {
    //         this.setState({})
    //     }).catch(err => {
    //         this.refreshWeb3Status()
    //         message.error("Could not connect")
    //         this.setState({ connectionError: err.message })
    //     })
    // }

    setEntityId(entityId: string) {
        this.setState({ entityId })
    }
    setProcessId(processId: string) {
        this.setState({ processId })
    }
    setUrlHash(urlHash: string) {
        this.setState({ urlHash })
    }

    // async refreshWeb3Status() {
    //     const { isConnected } = getNetworkState()
    //     this.setState({ isConnected })
    // }

    // onGatewayError(type: "private" | "public") {
    //     // TODO: reconnect or shift
    //     new Promise(resolve => setTimeout(resolve, 1000 * 3))
    //         .then(() => initNetwork()).then(() => {
    //             // message.success("Connected")
    //             this.refreshWeb3Status()
    //         }).catch(err => {
    //             this.refreshWeb3Status()
    //             message.error("Could not connect")
    //         })
    // }

    // componentDidCatch(error: Error, _errorInfo: any/*ErrorInfo*/) {
    //     console.error(error)
    //     return <GeneralError />
    // }

    renderPleaseWait() {
        return null // The loading message will appear

        // return <div id="global-loading">
        //     <div><Spin indicator={<LoadingOutlined />} /> &nbsp;Please, wait... </div>
        // </div>
    }

    // renderRetry() {
    //     return <div id="index">
    //         <Row justify="center" align="middle">
    //             <Col xs={24} sm={18} md={10}>
    //                 <Card title="Connection Error" className="card">
    //                     <p>Oops! There has been a problem while connecting to our services.</p>
    //                     <div style={{ textAlign: "center" }}>
    //                         <Button type="primary" onClick={() => this.setState({ connectionError: false }, () => this.connect())}><ReloadOutlined />Retry</Button>
    //                     </div>
    //                 </Card>
    //             </Col>
    //         </Row>
    //     </div>
    // }

    render() {
        // if (!this.state.isConnected) {
        //     if (this.state.connectionError) {
        //         return this.renderRetry()
        //     }

        //     return this.renderPleaseWait()
        // }

        // Main render

        // Get data from getInitialProps and provide it as the global context to children
        const { Component, pageProps } = this.props
        const { provider, signer } = getWeb3()
        const pool = getPool()

        const injectedGlobalContext: IAppContext = {
            provider,
            signer,
            pool,
            setEntityId: (id: string) => this.setEntityId(id),
            setProcessId: (id: string) => this.setProcessId(id),
            setUrlHash: (hash: string) => this.setUrlHash(hash),
            entityId: this.state.entityId,
            processId: this.state.processId,
            urlHash: this.state.urlHash,
        }

        return <AppContext.Provider value={injectedGlobalContext}>
            <Head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>Bridge</title>
            </Head>
            <Header />
            <div id="main">
                <Component {...pageProps} />
            </div>
            <Footer />
        </AppContext.Provider>
    }
}

export default MainApp

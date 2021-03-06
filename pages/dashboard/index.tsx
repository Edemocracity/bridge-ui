import { useContext, Component } from 'react'
import Link from 'next/link'
import { EntityApi, ProcessContractParameters, ProcessMetadata, VotingApi } from 'dvote-js'
import Spinner from "react-svg-spinner"

// import { message, Button, Spin, Divider, Input, Select, Col, Row, Card, Modal } from 'antd'
// import { LoadingOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
// import { getEntityId } from 'dvote-js/dist/api/entity'
// import Router from 'next/router'

// import { getGatewayClients, getNetworkState } from '../../lib/network'
import AppContext, { IAppContext } from '../../lib/app-context'
import TokenCard from '../../components/token-card'
import Select from 'react-select'
import { allTokens } from '../../lib/tokens'
import { ensureConnectedVochain, getTokenProcesses } from '../../lib/api'
import { YOU_ARE_NOT_CONNECTED } from '../../lib/errors'
import { getPool } from '../../lib/vochain'
// import { strDateDiff } from '../../lib/date'
import { ProcessInfo } from '../../lib/types'
import { limitedText } from '../../lib/util'
import { WalletStatus } from '../../components/wallet-status'

// MAIN COMPONENT
const DashboardPage = props => {
    // Get the global context and pass it to our stateful component
    const context = useContext(AppContext)

    return <DashboardView {...context} />
}

type State = {
    loading: boolean,
    offline: boolean,
    blockNumber: number,
    filteredProcesses: ProcessInfo[]
}

// Stateful component
class DashboardView extends Component<IAppContext, State> {
    state: State = {
        loading: false,
        offline: false,
        blockNumber: undefined,
        filteredProcesses: null
    }

    componentDidMount() {
        return this.loadCurrentBlock()
            .then(() => this.loadTokenProcesses())
            .catch(err => {
                if (err && err.message == YOU_ARE_NOT_CONNECTED) {
                    this.setState({ offline: true })
                    return
                }
            })
    }

    async loadCurrentBlock() {
        await ensureConnectedVochain()
        const pool = getPool()

        const height = await VotingApi.getBlockHeight(pool)
        this.setState({ blockNumber: height })
    }

    loadTokenProcesses(targetTokenAddress?: string) {
        this.setState({ loading: true })

        return getTokenProcesses(targetTokenAddress)
            .then((processes) => {
                // Only update the global list if not doing a filtered load
                this.setState({ loading: false, offline: false, filteredProcesses: processes })
            })
            .catch(err => {
                this.setState({ loading: false })

                if (err && err.message == YOU_ARE_NOT_CONNECTED) {
                    this.setState({ offline: true })
                    return
                }

                alert("The list of processes could not be loaded")
            })
    }

    onTokenFilter(value: { value: string, label: string }, options: { action: string, option: any, name: any }) {
        const token = allTokens.find(t => t.symbol == value.value)
        if (!token) {
            return this.loadTokenProcesses()
        }
        return this.loadTokenProcesses(token.address)
    }

    render() {
        const { holderAddress } = this.props
        const options = allTokens.map(token => ({ label: token.name, value: token.symbol }))
        options.unshift({ label: "(all tokens)", value: "" })

        const processes = this.state.filteredProcesses || []

        const upcomingProcesses = processes.filter(
            proc => this.state.blockNumber < proc.parameters.startBlock
        )
        const activeProcesses = processes.filter(
            proc => this.state.blockNumber >= proc.parameters.startBlock &&
                this.state.blockNumber < (proc.parameters.startBlock + proc.parameters.blockCount)
        )
        const endedProcesses = processes.filter(
            proc => this.state.blockNumber >= (proc.parameters.startBlock + proc.parameters.blockCount)
        )

        return <div id="dashboard">
            <div className="page-head">
                <div className="left">
                    <h1>My Dashboard</h1>
                    <h4 className="accent-1">Vote on the open processes and see the results of the ones that already ended.</h4>
                </div>
                <div className="right">
                    <WalletStatus address={holderAddress} />
                    <Select options={options} onChange={(value, options) => this.onTokenFilter(value, options)} />
                </div>
            </div>

            <div className="row-main">
                <h2>Active votes</h2>
                <p className="light">{
                    endedProcesses.length ?
                        "Below are the votes belonging to the available tokens." :
                        "There are no active votes at this moment."
                }</p>

                <div className="token-list">
                    {
                        this.state.loading ? <Spinner /> :
                            activeProcesses.map(proc => <TokenCard key={proc.id} name={proc.token.symbol} icon="https://cdn.worldvectorlogo.com/logos/dai-2.svg" rightText={/*strDateDiff()*/""} href={"/processes#/" + proc.id}>
                                <p>
                                    <strong>{limitedText(proc.metadata.title.default, 35) || "No title"}</strong>
                                    <br />
                                    {limitedText(proc.metadata.description.default) || "No description"}
                                </p>
                            </TokenCard>)
                    }
                </div>
            </div>

            <div className="row-main">
                <h2>Vote results</h2>
                <p className="light">{
                    endedProcesses.length ?
                        "Below are the results for votes related to your tokens." :
                        "There are no votes with results to display."
                }</p>

                <div className="token-list">
                    {
                        this.state.loading ? <Spinner /> :
                            endedProcesses.map(proc => <TokenCard key={proc.id} name={proc.token.symbol} icon="https://cdn.worldvectorlogo.com/logos/dai-2.svg" rightText={/*strDateDiff()*/""} href={"/processes#/" + proc.id}>
                                <p>
                                    <strong>{limitedText(proc.metadata.title.default, 35) || "No title"}</strong>
                                    <br />
                                    {limitedText(proc.metadata.description.default) || "No description"}
                                </p>
                            </TokenCard>)
                    }
                </div>
            </div>

            <div className="row-main">
                <h2>Upcoming votes</h2>
                <p className="light">{
                    upcomingProcesses.length ?
                        "Below are the votes scheduled to start soon." :
                        "There are no votes scheduled to start soon."
                }</p>

                <div className="token-list">
                    {
                        this.state.loading ? <Spinner /> :
                            upcomingProcesses.map(proc => <TokenCard key={proc.id} name={proc.token.symbol} icon="https://cdn.worldvectorlogo.com/logos/dai-2.svg" rightText={/*strDateDiff()*/""} href={"/processes#/" + proc.id}>
                                <p>
                                    <strong>{limitedText(proc.metadata.title.default, 35) || "No title"}</strong>
                                    <br />
                                    {limitedText(proc.metadata.description.default) || "No description"}
                                </p>
                            </TokenCard>)
                    }
                </div>
            </div>

        </div>
    }
}

export default DashboardPage

import Web3 from 'web3'

export default function createProvider () {
  return new Web3.providers.WebsocketProvider(
    'wss://mainnet.eth.aragon.network/ws'
  )
}

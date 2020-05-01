import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter as Router } from 'react-router-dom'
import {
  GraphQLClient,
  ClientContext
} from 'graphql-hooks'
import { UseWalletProvider } from 'use-wallet'
import {
  Viewport
} from '@aragon/ui'
import App from './pages/app'

const client = new GraphQLClient({
  url: process.env.API_URL || 'https://daolist.1hive.org/'
})

const chainId = Number(process.env.CHAIN_ID) || 1

ReactDOM.render(
  <Router>
    <ClientContext.Provider value={client}>
      <Viewport.Provider>
        <UseWalletProvider chainId={chainId}>
          <App />
        </UseWalletProvider>
      </Viewport.Provider>
    </ClientContext.Provider>
  </Router>,
  document.getElementById('app')
)

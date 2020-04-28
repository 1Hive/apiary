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
  url: process.env.API_URL || 'http://localhost:3000'
})

ReactDOM.render(
  <Router>
    <ClientContext.Provider value={client}>
      <Viewport.Provider>
        <UseWalletProvider chainId={4}>
          <App />
        </UseWalletProvider>
      </Viewport.Provider>
    </ClientContext.Provider>
  </Router>,
  document.getElementById('app')
)

import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter as Router } from 'react-router-dom'
import {
  GraphQLClient,
  ClientContext
} from 'graphql-hooks'
import {
  Viewport
} from '@aragon/ui'
import App from './pages/app'

const client = new GraphQLClient({
  url: process.env.API_URL
})

ReactDOM.render(
  <Router>
    <ClientContext.Provider value={client}>
      <Viewport.Provider>
        <App />
      </Viewport.Provider>
    </ClientContext.Provider>
  </Router>,
  document.getElementById('app')
)

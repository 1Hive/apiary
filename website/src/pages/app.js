import React from 'react'
import { Redirect, Route, NavLink } from 'react-router-dom'
import { Main, IconSearch } from '@aragon/ui'
import { Layout, Sidebar, Content } from '../components/Layout'
import { Logo } from '../components/Logo'
import Organisations from './orgs'
import Apps from './apps'

const App = () =>
  <Main layout={false}>
    <Layout>
      <Sidebar>
        <NavLink
          to='/'
          exact
          isActive={(_, { pathname }) => ['/orgs', '/apps'].includes(pathname)}
        >
          <IconSearch />
        </NavLink>
        <div className='logo'>
          <Logo />
        </div>
      </Sidebar>
      <Content>
        <Route path='/' exact render={() => <Redirect to='/orgs' />} />
        <Route path='/orgs' exact component={Organisations} />
        <Route path='/apps' exact component={Apps} />
      </Content>
    </Layout>
  </Main>

export default App

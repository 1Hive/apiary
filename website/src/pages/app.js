import React from 'react'
import { Redirect, Route, NavLink } from 'react-router-dom'
import { Main, IconSearch, Info, GU } from '@aragon/ui'
import AccountModule from '../components/Account/AccountModule'
import { Layout, Sidebar, Content } from '../components/Layout'
import { Logo } from '../components/Logo'
import Organisations from './orgs'
import Apps from './apps'
import Profile from './profile'

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
        <AccountModule />
        <div className='logo'>
          <Logo />
        </div>
      </Sidebar>
      <Content>
        {process.env.MAINTENANCE && <div css={`margin-bottom: ${2 * GU}px`}>
          <Info mode='warning' title='Attention'>
            We are currently doing maintenace on our backend services. The information presented may not be complete at this time.
          </Info>
        </div>}
        <Route path='/' exact render={() => <Redirect to='/orgs' />} />
        <Route path='/orgs' exact component={Organisations} />
        <Route path='/apps' exact component={Apps} />
        <Route path='/profile' exact component={Profile} />
      </Content>
    </Layout>
  </Main>

export default App

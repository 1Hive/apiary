import React from 'react'
import { Route, NavLink } from 'react-router-dom'
import { Main, IconSearch } from '@aragon/ui'
import { Layout, Sidebar, Content } from '../components/Layout'
import { Logo } from '../components/Logo'
import Organisations from './orgs'

export default () =>
  <Main layout={false}>
    <Layout>
      <Sidebar>
        <NavLink exact to='/'>
          <IconSearch />
        </NavLink>
        <div className='logo'>
          <Logo />
        </div>
      </Sidebar>
      <Content>
        <Route path={['/', '/orgs']} exact component={Organisations} />
      </Content>
    </Layout>
  </Main>

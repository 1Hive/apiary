import React from 'react'
import ReactDOM from 'react-dom'
import styled from 'styled-components'
import {
  AragonApp,
  AppView,
  Text,
  Card
} from '@aragon/ui'

const Wrapper = styled(AragonApp)`
  display: flex;
  justify-content: start;
  align-items: top;
  flex-wrap: wrap;
  min-height: auto;
`

const Stats = styled.div`
  display: grid;
  grid-auto-flow: row;
  grid-gap: 25px;
  justify-items: start;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  width: 100%;
  margin-bottom: 1em;
`

const StatsCard = styled(Card).attrs({ width: '100%' })`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  flex-grow: 2;
  flex-basis: 250px;
  flex-shrink: 1;
`

const DaoGrid = styled.div`
  display: grid;
  grid-auto-flow: row;
  grid-gap: 25px;
  justify-items: start;
  grid-template-columns: repeat(auto-fit, minmax(224px, 1fr));
  width: 100%;
`

const DaoCard = styled(Card).attrs({ width: '100%', height: 'auto' })`
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 25px;
  transition: box-shadow 0.3s ease-in-out;
  cursor: pointer;
  height: 150px;

  &:hover {
    box-shadow: 0 5px 15px rgba(0,0,0,0.3);
  }
`

const Icon = styled.div`
  height: 64px;
  margin-bottom: 5px;
  img {
    display: block;
  }
`

const Img = styled.img`
  display: block;
`

const Name = styled.p`
  display: flex;
  width: 100%;
  justify-content: center;
  margin-bottom: 10px;
  word-break: break-word;
  padding: 0 .5em;
  text-align: center;
`

const fetchDaos = () =>
  fetch(process.env.API_URL || 'https://daolist.1hive.org').then(res => res.json())

class App extends React.Component {
  constructor () {
    super()

    this.state = { daos: null }
  }

  componentDidMount () {
    fetchDaos().then(daos => this.setState({ daos }))
  }

  openSafe (link) {
    var safeWindow = window.open()
    safeWindow.opener = null
    safeWindow.location = link
  }

  renderDao (dao) {
    return <DaoCard
      key={dao.name}
      onClick={() => this.openSafe(`https://mainnet.aragon.org/#/${dao.name || dao.address}`)}>
      <Icon>
        <Img width="64" height="64" src="dao.svg" alt="" />
      </Icon>
      <Name>{dao.name || dao.address}</Name>
    </DaoCard>
  }

  render () {
    if (!this.state.daos) {
      return (
        <AppView title="Apiary Explorer" backgroundLogo>
          <Wrapper publicUrl="/">Loading...</Wrapper>
        </AppView>
      )
    }

    return (
      <AppView title='Apiary Explorer'>
        <Wrapper publicUrl="/">
          <Stats>
            <StatsCard height="150px">
              <Text size="xxlarge">{this.state.daos.length}</Text>
              <Text size="small">DAOs since genesis</Text>
            </StatsCard>
          </Stats>
          <DaoGrid>
            {this.state.daos.map(this.renderDao.bind(this))}
          </DaoGrid>
        </Wrapper>
      </AppView>
    )
  }
}

ReactDOM.render(<App />, document.getElementById('app'))

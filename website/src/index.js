import React from 'react'
import ReactDOM from 'react-dom'
import ReactGA from 'react-ga'
import styled from 'styled-components'
import {
  AragonApp,
  AppView,
  Text,
  Card,
  Badge
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
  height: 175px;

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
`

const TagWrapper = styled.div`
  max-width: 100%;
  padding: 0 20px;
  margin-bottom: 10px;
`

const Tag = styled(Badge)`
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
  color: white;
`


const fetchDaos = () =>
  fetch('https://daolist-io.herokuapp.com').then(res => res.json())

class App extends React.Component {
  constructor () {
    super()

    this.state = { daos: null }
  }

  componentWillMount () {
    fetchDaos().then(daos => this.setState({ daos }))
  }

  kitName (kit) {
    const name = {
      '0x705Cd9a00b87Bb019a87beEB9a50334219aC4444': 'Democracy',
      '0x41bbaf498226b68415f1C78ED541c45A18fd7696': 'Multisig'
    }[kit]

    return name
  }

  kitColor (kit) {
    const color = {
      '0x705Cd9a00b87Bb019a87beEB9a50334219aC4444': 'rgb(2, 139, 207)',
      '0x41bbaf498226b68415f1C78ED541c45A18fd7696': 'rgb(127, 173, 220)'
    }[kit]

    return color
  }

  openSafe (link) {
    ReactGA.outboundLink({
      label: link
    })

    var safeWindow = window.open()
    safeWindow.opener = null
    safeWindow.location = link
  }

  renderDao (dao) {
    return <DaoCard
      key={dao.name}
      onClick={() => this.openSafe(`https://mainnet.aragon.org/#/${dao.name}.aragonid.eth`)}>
      <Icon>
        <Img width="64" height="64" src="https://mainnet.aragon.org/default.d2b45fd4.png" alt="" />
      </Icon>
      <Name>{dao.name}.aragonid.eth</Name>
      <TagWrapper>
        <Tag background={this.kitColor(dao.kit)}>{this.kitName(dao.kit)}</Tag>
      </TagWrapper>
    </DaoCard>
  }

  render () {
    if (!this.state.daos) {
      return (
        <AppView title="daolist.io" backgroundLogo>
          <Wrapper publicUrl="/">Loading...</Wrapper>
        </AppView>
      )
    }

    const daos = this.state.daos.sort((a, b) => {
      if (a.block > b.block) return -1
      if (a.block < b.block) return 1
      return 0
    })

    const kits = this.state.daos.reduce((kits = {}, dao) => {
      kits[dao.kit] = (kits[dao.kit] || 0) + 1

      return kits
    }, {})

    return (
      <AppView title='Daolist'>
        <Wrapper publicUrl="/">
          <Stats>
            <StatsCard height="150px">
              <Text size="xxlarge">{this.state.daos.length}</Text>
              <Text size="small">DAOs since genesis</Text>
            </StatsCard>
            <StatsCard height="150px">
              <Text size="xxlarge">{kits['0x41bbaf498226b68415f1C78ED541c45A18fd7696']}</Text>
              <Text size="small">Multisigs</Text>
            </StatsCard>
            <StatsCard height="150px">
              <Text size="xxlarge">{kits['0x705Cd9a00b87Bb019a87beEB9a50334219aC4444']}</Text>
              <Text size="small">Democracies</Text>
            </StatsCard>
          </Stats>
          <Text size="xlarge">Favorites</Text>
          <DaoGrid>
            {daos.slice(0, 6).map(this.renderDao.bind(this))}
          </DaoGrid>
          <Text size="xlarge">DAOs</Text>
          <DaoGrid>
            {daos.map(this.renderDao.bind(this))}
          </DaoGrid>
        </Wrapper>
      </AppView>
    )
  }
}

ReactGA.initialize('UA-129065081-1')
ReactGA.pageview(window.location.pathname + window.location.search)

ReactDOM.render(<App />, document.getElementById('app'))

import React from 'react'
import ReactDOM from 'react-dom'
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
  fetch(process.env.API_URL || 'https://daolist.1hive.org').then(res => res.json())

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
      '0x705Cd9a00b87Bb019a87beEB9a50334219aC4444': 'Democracy (1.0.0)',
      '0x7f3ed10366826a1227025445D4f4e3e14BBfc91d': 'Democracy (2.0.0)',
      '0x41bbaf498226b68415f1C78ED541c45A18fd7696': 'Multisig (1.0.0)',
      '0x87aa2980dde7d2D4e57191f16BB57cF80bf6E5A6': 'Multisig (2.0.0)'
    }[kit]

    return name
  }

  kitColor (kit) {
    const color = {
      '0x705Cd9a00b87Bb019a87beEB9a50334219aC4444': 'rgb(2, 139, 207)',
      '0x7f3ed10366826a1227025445D4f4e3e14BBfc91d': 'rgb(2, 139, 207)',
      '0x41bbaf498226b68415f1C78ED541c45A18fd7696': 'rgb(127, 173, 220)',
      '0x87aa2980dde7d2D4e57191f16BB57cF80bf6E5A6': 'rgb(127, 173, 220)'
    }[kit]

    return color
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
      {dao.kit &&
        <TagWrapper>
          <Tag background={this.kitColor(dao.kit)}>{this.kitName(dao.kit)}</Tag>
        </TagWrapper>}
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

    const daos = this.state.daos.sort((a, b) => {
      if (a.block > b.block) return -1
      if (a.block < b.block) return 1
      return 0
    })

    const kits = this.state.daos.reduce((kits = {}, dao) => {
      if (dao.kit) {
        kits[dao.kit] = (kits[dao.kit] || 0) + 1
      }

      return kits
    }, {})

    return (
      <AppView title='Apiary Explorer'>
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
          <DaoGrid>
            {daos.map(this.renderDao.bind(this))}
          </DaoGrid>
        </Wrapper>
      </AppView>
    )
  }
}

ReactDOM.render(<App />, document.getElementById('app'))

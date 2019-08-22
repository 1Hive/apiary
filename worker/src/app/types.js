export const LOG_APP_INSTALLED = [
  // NewAppProxy(address proxy, bool isUpgradeable, bytes32 appId)
  '0xd880e726dced8808d727f02dd0e6fdd3a945b24bfee77e13367bcbe61ddbaf47',
  [{
    type: 'address',
    name: 'proxy'
  }, {
    type: 'bool',
    name: 'isUpgradeable'
  }, {
    type: 'bytes32',
    name: 'appId'
  }]
]

export const LOG_APP_VERSION_PUBLISHED = [
  // NewVersion(uint256 versionId, uint16[3] semanticVersion)
  '0x003aea8189d1a0aa3ebdb05219cd4c2a663166706e949e9d6e8aa63718ca43fd',
  [{
    type: 'uint256',
    name: 'versionId'
  }, {
    type: 'uint16[3]',
    name: 'semanticVersion'
  }]
]

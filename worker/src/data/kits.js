export default {
  '0x705Cd9a00b87Bb019a87beEB9a50334219aC4444': {
    name: 'Democracy (1.0.0)',
    abi: {
      name: 'newInstance',
      constant: false,
      type: 'function',
      inputs: [
        {
          name: 'name',
          type: 'string'
        },
        {
          name: 'holders',
          type: 'address[]'
        },
        {
          name: 'tokens',
          type: 'uint256[]'
        },
        {
          name: 'supportNeeded',
          type: 'uint64'
        },
        {
          name: 'minAcceptanceQuorum',
          type: 'uint64'
        },
        {
          name: 'voteDuration',
          type: 'uint64'
        }
      ],
      outputs: []
    }
  },
  '0x7f3ed10366826a1227025445D4f4e3e14BBfc91d': {
    name: 'Democracy (2.0.0)',
    abi: {
      name: 'newInstance',
      constant: false,
      type: 'function',
      inputs: [
        {
          name: 'name',
          type: 'string'
        },
        {
          name: 'holders',
          type: 'address[]'
        },
        {
          name: 'tokens',
          type: 'uint256[]'
        },
        {
          name: 'supportNeeded',
          type: 'uint64'
        },
        {
          name: 'minAcceptanceQuorum',
          type: 'uint64'
        },
        {
          name: 'voteDuration',
          type: 'uint64'
        }
      ],
      outputs: []
    }
  },
  '0x41bbaf498226b68415f1C78ED541c45A18fd7696': {
    name: 'Multisig (1.0.0)',
    abi: {
      name: 'newInstance',
      constant: false,
      type: 'function',
      inputs: [
        {
          name: 'name',
          type: 'string'
        },
        {
          name: 'signers',
          type: 'address[]'
        },
        {
          name: 'neededSignatures',
          type: 'uint256'
        }
      ],
      outputs: []
    }
  },
  '0x87aa2980dde7d2D4e57191f16BB57cF80bf6E5A6': {
    name: 'Multisig (2.0.0)',
    abi: {
      name: 'newInstance',
      constant: false,
      type: 'function',
      inputs: [
        {
          name: 'name',
          type: 'string'
        },
        {
          name: 'signers',
          type: 'address[]'
        },
        {
          name: 'neededSignatures',
          type: 'uint256'
        }
      ],
      outputs: []
    }
  }
}

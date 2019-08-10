export function safeUpsert (collection, filter, update) {
  return collection
    .updateOne(filter, update, { upsert: true })
    .catch(_ => collection.updateOne(filter, update))
}

export function getKernelAddress (web3, address) {
  const data = web3.eth.abi.encodeFunctionCall(
    {
      name: 'kernel',
      type: 'function',
      inputs: []
    },
    []
  )

  return web3.eth
    .call({
      to: address,
      data
    })
    .then(out => web3.eth.abi.decodeParameter('address', out))
}

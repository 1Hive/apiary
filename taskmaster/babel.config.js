module.exports = (api) => ({
  presets: [
    [
      '@babel/preset-env',
      {
        modules: api.env('test') ? 'cjs' : false,
        targets: {
          node: 'current'
        }
      }
    ]
  ]
})

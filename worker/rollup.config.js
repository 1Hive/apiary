import json from 'rollup-plugin-json'
import resolve from 'rollup-plugin-node-resolve'
import cjs from 'rollup-plugin-commonjs'
import babel from 'rollup-plugin-babel'

export default {
  input: 'src/index.js',
  output: {
    file: 'dist/index.js',
    format: 'cjs'
  },
  plugins: [
    json(),
    babel({
      exclude: /node_modules/
    }),
    resolve({
      preferBuiltins: true
    }),
    cjs({
      include: /node_modules/,
      ignore: ['pg-native', './native']
    })
  ],
  external: [
    'cofx',
    'pino',
    'web3',
    'web3-eth-abi',
    'got',
    'mongodb',
    'redis',
    'pg',
    'pg-native'
  ]
}

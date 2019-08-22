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
    babel({
      exclude: /node_modules/
    }),
    resolve(),
    cjs({
      include: /node_modules/
    })
  ],
  external: ['cofx', 'pino', 'web3', 'web3-eth-abi', 'got', 'mongodb', 'redis']
}

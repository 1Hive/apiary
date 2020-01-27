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
    'pg',
    'pg-native',
    'redis',
    'bee-queue'
  ]
}

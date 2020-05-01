import graphql from 'rollup-plugin-graphql'
import json from '@rollup/plugin-json'

export default {
  input: 'src/index.js',
  output: {
    file: 'dist/index.js',
    format: 'cjs'
  },
  plugins: [
    graphql(),
    json()
  ]
}

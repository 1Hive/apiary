import graphql from 'rollup-plugin-graphql'

export default {
  input: 'src/index.js',
  output: {
    file: 'dist/index.js',
    format: 'cjs'
  },
  plugins: [
    graphql()
  ]
}

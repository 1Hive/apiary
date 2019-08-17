import Base64URL from 'base64-url'
import { GraphQLScalarType } from 'graphql'
import { Kind } from 'graphql/language'

export function toCursor ({ value }) {
  return Base64URL.encode(JSON.stringify(value))
}

export function fromCursor (string) {
  const value = JSON.parse(Base64URL.decode(string))
  if (value) {
    return value
  } else {
    return null
  }
}

const Cursor = new GraphQLScalarType({
  name: 'Cursor',
  serialize (value) {
    if (value.value) {
      return toCursor(value)
    } else {
      return null
    }
  },
  parseLiteral (ast) {
    if (ast.kind === Kind.STRING) {
      return fromCursor(ast.value)
    } else {
      return null
    }
  },
  parseValue (value) {
    return fromCursor(value)
  }
})

const DateTime = new GraphQLScalarType({
  name: 'DateTime',
  serialize (value) {
    if (value) {
      return new Date(value * 1000)
    }

    return null
  },
  parseLiteral (ast) {
    if (ast.kind === Kind.NUMBER) {
      return ast.value
    } else if (ast.kind === Kind.STRING) {
      return Date.parse(ast.value) / 1000 || null
    }

    return null
  },
  parseValue (value) {
    if (!isNaN(value)) {
      return parseInt(value, 10)
    }

    return Date.parse(value) / 1000 || null
  }
})

export default {
  Cursor,
  DateTime
}

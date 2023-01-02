import {
  ArrayOfSchema,
  isArrayOfSchema,
  isLiteralSchema,
  isObjectSchema,
  isOneOfSchema,
  isPrimitiveSchema,
  LiteralSchema,
  ObjectSchema,
  OneOfSchema,
  PrimitiveSchema,
  Schema,
  Type,
} from './Type'

export function explain<R>(type: Type<R>, value: any): Explanation | undefined {
  const { schema } = type
  return explainSchema(schema, value)
}

function explainSchema(schema: Schema, value: any): Explanation | undefined {
  if (isPrimitiveSchema(schema)) {
    return explainPrimitive(schema, value)
  }
  if (isLiteralSchema(schema)) {
    return explainLiteral(schema, value)
  }
  if (isObjectSchema(schema)) {
    return explainObject(schema, value)
  }
  if (isOneOfSchema(schema)) {
    return explainOneOf(schema, value)
  }
  if (isArrayOfSchema(schema)) {
    return explainArrayOf(schema, value)
  }
  throw new Error(`Not yet implemented: ${schema} against ${value}`)
}

function explainPrimitive(schema: PrimitiveSchema, value: any): Explanation | undefined {
  if (typeof value === schema) {
    return undefined
  }
  return { value, not: schema }
}

function explainLiteral(schema: LiteralSchema, value: any): Explanation | undefined {
  if (schema.literal === value) {
    return undefined
  }
  return { value, not: schema }
}

function explainObject(schema: ObjectSchema, value: any): Explanation | undefined {
  if (typeof value !== 'object') {
    return {
      value,
      not: schema,
    }
  }
  const objectSchema = schema.object
  const cause: Cause[] = []
  for (let [key, schemaAtKey] of Object.entries(objectSchema)) {
    const optional = key.endsWith('?')
    key = optional ? key.slice(0, -1) : key

    if (optional && !value.hasOwnProperty(key)) continue
    if (optional && value[key] === undefined) continue
    if (!optional && value[key] === undefined) {
      cause.push({ missingKey: key })
      continue
    }

    const why = explainSchema(schemaAtKey, value[key])
    if (!why) continue

    cause.push({ atKey: key, ...why })
  }
  return cause.length === 0 ? undefined : { value, not: schema, cause }
}

function explainOneOf(schema: OneOfSchema, value: any): Explanation | undefined {
  const schemas = schema.oneOf
  const cause: Cause[] = []
  for (const altSchema of schemas) {
    const why = explainSchema(altSchema, value)
    if (!why) {
      return undefined
    }
    cause.push(why)
  }
  return {
    value,
    not: schema,
    cause,
  }
}

function explainArrayOf(schema: ArrayOfSchema, value: any): Explanation | undefined {
  if (!Array.isArray(value)) {
    return {
      value,
      not: schema,
    }
  }
  let pos = 0
  let cause: Cause[] = []
  for (const el of value) {
    const why = explainSchema(schema.arrayOf, el)
    if (!why) continue

    cause.push({ atKey: pos, ...why })
    pos += 1
  }

  return cause.length === 0 ? undefined : { value, not: schema, cause }
}

// ======================================================================
// Explanation
// ======================================================================
interface Explanation {
  value: any
  not: Not
  cause?: Cause[]
}

type Not = Schema

type Cause = ({ atKey: Key } & Explanation) | { missingKey: Key } | Explanation

// ----------------------------------------------------------------------
// Key
// ----------------------------------------------------------------------
type Key = string | symbol | number

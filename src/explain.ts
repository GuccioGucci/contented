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
  return { value, isNot: schema }
}

function explainLiteral(schema: LiteralSchema, value: any): Explanation | undefined {
  if (schema.literal === value) {
    return undefined
  }
  return { value, isNot: schema }
}

function explainObject(schema: ObjectSchema, value: any): Explanation | undefined {
  if (typeof value !== 'object') {
    return {
      value,
      isNot: schema,
    }
  }
  const objectSchema = schema.object
  const since: NestedExplanation[] = []
  for (let [key, schemaAtKey] of Object.entries(objectSchema)) {
    const optional = key.endsWith('?')
    key = optional ? key.slice(0, -1) : key

    if (optional && !value.hasOwnProperty(key)) continue
    if (optional && value[key] === undefined) continue
    if (!optional && value[key] === undefined) {
      since.push({ missingKey: key })
      continue
    }

    const exp = explainSchema(schemaAtKey, value[key])
    if (!exp) continue

    since.push({ atKey: key, ...exp })
  }
  return since.length === 0 ? undefined : { value, isNot: schema, since: since }
}

function explainOneOf(schema: OneOfSchema, value: any): Explanation | undefined {
  const schemas = schema.oneOf
  const since: NestedExplanation[] = []
  for (const altSchema of schemas) {
    const exp = explainSchema(altSchema, value)
    if (!exp) {
      return undefined
    }
    since.push(exp)
  }
  return {
    value,
    isNot: schema,
    since: since,
  }
}

function explainArrayOf(schema: ArrayOfSchema, value: any): Explanation | undefined {
  if (!Array.isArray(value)) {
    return {
      value,
      isNot: schema,
    }
  }
  let since: NestedExplanation[] = []
  for (const [idx, el] of indexed(value)) {
    const exp = explainSchema(schema.arrayOf, el)
    if (!exp) continue

    since.push({ atKey: idx, ...exp })
  }

  return since.length === 0 ? undefined : { value, isNot: schema, since: since }
}

// ======================================================================
// Explanation
// ======================================================================
interface Explanation {
  value: any
  isNot: IsNot
  since?: NestedExplanation[]
}

type IsNot = Schema

type NestedExplanation = ({ atKey: Key } & Explanation) | { missingKey: Key } | Explanation

// ----------------------------------------------------------------------
// Key
// ----------------------------------------------------------------------
type Key = string | symbol | number

// ======================================================================
// Helpers
// ======================================================================
function* indexed<A>(it: Iterable<A>) {
  let pos = 0
  for (const x of it) {
    yield [pos, x]
    pos += 1
  }
}

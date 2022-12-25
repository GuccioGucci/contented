import { CoercionError, InvalidType, MissingKey, scope } from './coercion'
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

export function explain<R>(type: Type<R>, value: any): WhyValueIsNot<R> | undefined {
  const { schema } = type
  return explainSchema(schema, value)
}

function explainSchema(schema: Schema, value: any): any {
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

function explainPrimitive(schema: PrimitiveSchema, value: any): any {
  if (typeof value === schema) {
    return undefined
  }
  return {
    value,
    not: schema,
    cause: [new InvalidType(schema, value)],
  }
}

function explainLiteral(schema: LiteralSchema, value: any): any {
  if (schema.literal === value) {
    return undefined
  }
  return {
    value,
    not: schema,
    cause: [new InvalidType(`${schema.literal}`, value)],
  }
}

function explainObject(schema: ObjectSchema, value: any): any {
  if (typeof value !== 'object') {
    return {
      value,
      not: schema,
      cause: [new InvalidType('object', value)],
    }
  }
  const objectSchema = schema.object
  const cause: CoercionError[] = []
  for (let [key, schemaAtKey] of Object.entries(objectSchema)) {
    const optional = key.endsWith('?')
    key = optional ? key.slice(0, -1) : key

    if (optional && !value.hasOwnProperty(key)) continue
    if (optional && value[key] === undefined) continue
    if (!optional && value[key] === undefined) {
      cause.push(new MissingKey([key]))
      continue
    }

    const why = explainSchema(schemaAtKey, value[key])
    if (!why) continue

    cause.push(...why.cause.map((c: CoercionError) => scope([key], c)))
  }
  return (cause.length === 0) ? undefined : { value, not: schema, cause }
}

function explainOneOf(schema: OneOfSchema, value: any): any {
  const schemas = schema.oneOf
  const cause: CoercionError[] = []
  for (const altSchema of schemas) {
    const why = explainSchema(altSchema, value)
    if (!why) {
      return undefined
    }

    cause.push(...why.cause)
  }
  return {
    value,
    not: schema,
    cause,
  }
}

function explainArrayOf(schema: ArrayOfSchema, value: any): any {
  if (!Array.isArray(value)) {
    return {
      value,
      not: schema,
      cause: [new InvalidType('array', value)],
    }
  }
  let pos = 0
  let cause: CoercionError[] = []
  for (const el of value) {
    const why = explainSchema(schema.arrayOf, el)
    if (!why) continue

    cause.push(...why.cause.map((c: CoercionError) => scope([pos], c)))
    pos += 1
  }

  return cause.length === 0 ? undefined : { value, not: schema, cause }
}

interface WhyValueIsNot<_R> {
  value: any
  not: Not
  cause: CoercionError[]
}

type Not = Schema

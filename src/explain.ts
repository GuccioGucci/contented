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
    cause: [{ value, not: schema }],
  }
}

function explainLiteral(schema: LiteralSchema, value: any): any {
  if (schema.literal === value) {
    return undefined
  }
  return {
    value,
    not: schema,
    cause: [{ value, not: schema }],
  }
}

function explainObject(schema: ObjectSchema, value: any): any {
  if (typeof value !== 'object') {
    return {
      value,
      not: schema,
      cause: [{ value, not: schema }],
    }
  }
  const objectSchema = schema.object
  const cause: (CoercionError | Cause)[] = []
  for (let [key, schemaAtKey] of Object.entries(objectSchema)) {
    const optional = key.endsWith('?')
    key = optional ? key.slice(0, -1) : key

    if (optional && !value.hasOwnProperty(key)) continue
    if (optional && value[key] === undefined) continue
    if (!optional && value[key] === undefined) {
      cause.push({ missingKey: [key] })
      continue
    }

    const why = explainSchema(schemaAtKey, value[key])
    if (!why) continue

    cause.push(...why.cause.map((c: CoercionError) => scope([key], c)))
  }
  return cause.length === 0 ? undefined : { value, not: schema, cause }
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
      cause: [{ value, not: schema }],
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
  cause: (CoercionError | Cause)[]
}

type Not = Schema

type Cause = { value: any; not: Not } | { missingKey: Path }

function scope(path: Path, error: CoercionError | Cause): CoercionError | Cause {
  if (error instanceof CoercionError) {
    if (error instanceof AtKey) {
      return new AtKey(path.concat(error.atKey), error.error)
    }
    /* c8 ignore next */
    throw new Error(`Unknown error type: ${error}`)
  }

  // Cause
  if ('missingKey' in error) {
    return { missingKey: path.concat(error.missingKey) }
  }
  return new AtKey(path, error)
}

// ======================================================================
// Coercion Error
// ======================================================================
const COERCION_ERROR = Symbol()

export abstract class CoercionError {
  //@ts-ignore
  private readonly [COERCION_ERROR]: true
}

// ----------------------------------------------------------------------
// AtKey
// ----------------------------------------------------------------------
const AT_KEY = Symbol()

export class AtKey<E> extends CoercionError {
  // @ts-ignore
  private readonly [AT_KEY]: true

  constructor(public readonly atKey: Path, public readonly error: E) {
    super()
  }
}

// ----------------------------------------------------------------------
// Path
// ----------------------------------------------------------------------
type Path = Key[]

type Key = string | symbol | number

import {
  Type,
  PrimitiveSchema,
  isPrimitiveSchema,
  Schema,
  isLiteralSchema,
  LiteralSchema,
  ObjectSchema,
  isObjectSchema,
  isOneOfSchema,
  OneOfSchema,
  isArrayOfSchema,
  ArrayOfSchema,
} from './Type'

export function coerceTo<R>(type: Type<R>, value: any): R | undefined {
  const { schema } = type
  return coerce(schema, value)
}

function coerce(schema: Schema, value: any): any {
  if (isPrimitiveSchema(schema)) {
    return coercePrimitive(schema, value)
  }
  if (isLiteralSchema(schema)) {
    return coerceLiteral(schema, value)
  }
  if (isObjectSchema(schema)) {
    return coerceObject(schema, value)
  }
  if (isOneOfSchema(schema)) {
    return coerceOneOf(schema, value)
  }
  if (isArrayOfSchema(schema)) {
    return coerceArrayOf(schema, value)
  }
}

function coercePrimitive(schema: PrimitiveSchema, value: any): any {
  return typeof value === schema ? value : undefined
}

function coerceLiteral(schema: LiteralSchema, value: any): any {
  return schema.literal === value ? value : undefined
}

function coerceObject(schema: ObjectSchema, value: any): any {
  if (typeof value !== 'object') {
    return undefined
  }

  const objectSchema = schema.object
  for (let [key, schemaAtKey] of Object.entries(objectSchema)) {
    const optional = key.endsWith('?')
    key = optional ? key.slice(0, -1) : key

    if (optional && !value.hasOwnProperty(key)) continue
    if (optional && value[key] === undefined) continue
    if (!optional && value[key] === undefined) return undefined

    const res = coerce(schemaAtKey, value[key])
    if (!res) {
      return undefined
    }
  }

  return value
}

function coerceArrayOf(schema: ArrayOfSchema, value: any): any {
  if (!Array.isArray(value)) {
    return undefined
  }

  for (const el of value) {
    const res = coerce(schema.arrayOf, el)
    if (!res) {
      return undefined
    }
  }
  return value
}

function coerceOneOf(schema: OneOfSchema, value: any): any {
  const schemas = schema.oneOf
  for (let schema of schemas) {
    const res = coerce(schema, value)
    if (res !== undefined) {
      return res
    }
  }
  return undefined
}

export function scope(path: Path, error: CoercionError): CoercionError {
  if (error instanceof AtKey) {
    return new AtKey(path.concat(error.atKey), error.error)
  }
  if (error instanceof MissingKey) {
    return new MissingKey(path.concat(error.missingKey))
  }
  if (error instanceof InvalidType) {
    return new AtKey(path, error)
  }
  if (error instanceof Joint) {
    return new Joint(error.errors.map((inner: CoercionError) => scope(path, inner)))
  }
  /* c8 ignore next */
  throw new Error(`Unknown error type: ${error}`)
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
// InvalidType
// ----------------------------------------------------------------------
const INVALID_TYPE = Symbol()

export class InvalidType extends CoercionError {
  // @ts-ignore
  private readonly [INVALID_TYPE]: true

  constructor(public readonly expected: string, public readonly got: any) {
    super()
  }
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
// MissingKey
// ----------------------------------------------------------------------
const MISSING_KEY = Symbol()

export class MissingKey extends CoercionError {
  // @ts-ignore
  private readonly [MISSING_KEY]: true

  constructor(public readonly missingKey: Path) {
    super()
  }
}

// ----------------------------------------------------------------------
// Joint
// ----------------------------------------------------------------------
const JOINT = Symbol()

export class Joint<E extends unknown[]> extends CoercionError {
  // @ts-ignore
  private readonly [JOINT]: true

  constructor(public readonly errors: E) {
    super()
  }
}

// ----------------------------------------------------------------------
// Path
// ----------------------------------------------------------------------
type Path = Key[]

type Key = string | symbol | number

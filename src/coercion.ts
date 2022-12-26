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

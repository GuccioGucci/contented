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
  return isValid(type, value) ? value : undefined
}

export function isValid<R>(type: Type<R>, value: any): value is R {
  const { schema } = type
  return isValidSchema(schema, value)
}

function isValidSchema(schema: Schema, value: any): boolean {
  if (isPrimitiveSchema(schema)) {
    return isValidPrimitive(schema, value)
  }
  if (isLiteralSchema(schema)) {
    return isValidLiteral(schema, value)
  }
  if (isObjectSchema(schema)) {
    return isValidObject(schema, value)
  }
  if (isOneOfSchema(schema)) {
    return isValidOneOf(schema, value)
  }
  if (isArrayOfSchema(schema)) {
    return isValidArrayOf(schema, value)
  }
  throw new Error(`Unknown schema: ${schema}`)
}

function isValidPrimitive(schema: PrimitiveSchema, value: any): boolean {
  return typeof value === schema
}

function isValidLiteral(schema: LiteralSchema, value: any): boolean {
  return schema.literal === value
}

function isValidObject(schema: ObjectSchema, value: any): boolean {
  if (typeof value !== 'object') {
    return false
  }

  const objectSchema = schema.object
  for (let [key, schemaAtKey] of Object.entries(objectSchema)) {
    const optional = key.endsWith('?')
    key = optional ? key.slice(0, -1) : key

    if (optional && !value.hasOwnProperty(key)) continue
    if (optional && value[key] === undefined) continue
    if (!optional && value[key] === undefined) return false

    const valid = isValidSchema(schemaAtKey, value[key])
    if (!valid) {
      return false
    }
  }

  return true
}

function isValidArrayOf(schema: ArrayOfSchema, value: any): boolean {
  if (!Array.isArray(value)) {
    return false
  }

  for (const el of value) {
    const valid = isValidSchema(schema.arrayOf, el)
    if (!valid) {
      return false
    }
  }
  return true
}

function isValidOneOf(schema: OneOfSchema, value: any): boolean {
  const schemas = schema.oneOf
  for (const altSchema of schemas) {
    const valid = isValidSchema(altSchema, value)
    if (valid) {
      return true
    }
  }
  return false
}

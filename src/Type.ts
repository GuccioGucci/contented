// ======================================================================
// Type
// ======================================================================
export interface Type<_R> {
  // Type<R> is an interface because the user need not know what constitues a
  // Type<R> (IntelliSense does not expand interfaces)
  schema: Schema
}

export type Infer<T> = T extends Type<infer R> ? R : never

// ======================================================================
// Schema
// ======================================================================
export type Schema = PrimitiveSchema | LiteralSchema | ObjectSchema | OneOfSchema | AllOfSchema | ArrayOfSchema

// ----------------------------------------------------------------------
// Primitive
// ----------------------------------------------------------------------
export type PrimitiveSchema = 'string' | 'boolean' | 'number' | 'null'

export function isPrimitiveSchema(schema: Schema): schema is PrimitiveSchema {
  return schema === 'string' || schema === 'boolean' || schema === 'number' || schema === 'null'
}

// ----------------------------------------------------------------------
// Literal
// ----------------------------------------------------------------------
export type LiteralSchema = { literal: unknown }

export function isLiteralSchema(schema: Schema): schema is LiteralSchema {
  return typeof schema === 'object' && 'literal' in schema
}

// ----------------------------------------------------------------------
// Object
// ----------------------------------------------------------------------
export type ObjectSchema = { object: Record<string, Schema> }

export function isObjectSchema(schema: Schema): schema is ObjectSchema {
  return typeof schema === 'object' && 'object' in schema
}

// ----------------------------------------------------------------------
// OneOf
// ----------------------------------------------------------------------
export type OneOfSchema = { oneOf: Schema[] }

export function isOneOfSchema(schema: Schema): schema is OneOfSchema {
  return typeof schema === 'object' && 'oneOf' in schema
}

// ----------------------------------------------------------------------
// AllOf
// ----------------------------------------------------------------------
export type AllOfSchema = { allOf: Schema[] }

export function isAllOfSchema(schema: Schema): schema is AllOfSchema {
  return typeof schema === 'object' && 'allOf' in schema
}

// ----------------------------------------------------------------------
// Array
// ----------------------------------------------------------------------
export type ArrayOfSchema = { arrayOf: Schema }

export function isArrayOfSchema(schema: Schema): schema is ArrayOfSchema {
  return typeof schema === 'object' && 'arrayOf' in schema
}

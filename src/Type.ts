import { IsTypeOf, Any, IsUnion, Not, Every } from './_typefunc'

// Type<R> is an interface because the user need not know what constitues a Type<R> (IntelliSense does not expand interfaces)
export interface Type<_R> {
  schema: Schema
}

export type Infer<T> = T extends Type<infer R> ? R : never

export type Schema = PrimitiveSchema | MatchSchema | ObjectSchema | OneOfSchema | ArrayOfSchema

// ======================================================================
// Primitive
// ======================================================================
export type PrimitiveSchema = 'string' | 'boolean' | 'number'

export function isPrimitiveSchema(schema: Schema): schema is PrimitiveSchema {
  return schema === 'string' || schema === 'boolean' || schema === 'number'
}

export type IsPrimitive<R> = Any<[IsTypeOf<R, string>, IsTypeOf<R, boolean>, IsTypeOf<R, number>]>

// ======================================================================
// Match
// ======================================================================
export type MatchSchema = { match: unknown }

export function isMatchSchema(schema: Schema): schema is MatchSchema {
  return typeof schema === 'object' && 'match' in schema
}

export type IsMatch<R> = Every<
  [
    Not<IsUnion<R>>,
    Any<[R extends string ? true : false, R extends number ? true : false, R extends boolean ? true : false]>
  ]
>

// ======================================================================
// Object
// ======================================================================
export type ObjectSchema = { object: Record<string, Schema> }

export function isObjectSchema(schema: Schema): schema is ObjectSchema {
  return typeof schema === 'object' && 'object' in schema
}

export type IsObject<R> = [R] extends [object] ? true : false

// ======================================================================
// OneOf
// ======================================================================
export type OneOfSchema = { oneOf: Schema[] }

export function isOneOfSchema(schema: Schema): schema is OneOfSchema {
  return typeof schema === 'object' && 'oneOf' in schema
}

export type IsOneOf<R> = IsUnion<R>

// ======================================================================
// Object
// ======================================================================
export type ArrayOfSchema = { arrayOf: Schema }

export function isArrayOfSchema(schema: Schema): schema is ArrayOfSchema {
  return typeof schema === 'object' && 'arrayOf' in schema
}

export type IsArray<R> = [R] extends [any[]] ? true : false

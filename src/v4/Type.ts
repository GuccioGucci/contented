import { IsTypeOf, Narrow, Any, Expand, IsUnion, Not, Every } from '../_typefunc'

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

// ======================================================================
// Programs
// ======================================================================
export const string: Type<string> = { schema: 'string' }

export const number: Type<number> = { schema: 'number' }

export const boolean: Type<boolean> = { schema: 'boolean' }

export function match<R extends string | number | boolean>(match: Narrow<R>): Type<Narrow<R>> {
  return { schema: { match } }
}

export function oneOf<Types extends Type<unknown>[]>(...types: Types): Type<OneOf<Types>> {
  const oneOf = types.map((type) => type.schema)
  return { schema: { oneOf } }
}

type OneOf<Types> = Types extends [infer Head, ...infer Rest] ? Infer<Head> | OneOf<Rest> : never

export function arrayOf<R>(type: Type<R>): Type<R[]> {
  return { schema: { arrayOf: type.schema } }
}

export function object<O extends Record<string, Type<unknown>>>(obj: O): Type<SequenceObject<O>> {
  const object: Record<string, Schema> = {}
  for (const [key, type] of Object.entries(obj)) {
    object[key] = type.schema
  }

  return { schema: { object } }
}

type SequenceObject<O extends object> = Expand<
  InferObject<RemoveQuestionMarkFromKeys<SetKeysOptional<SetValuesOptional<O>>>>
>

type SetValuesOptional<O extends object> = { [K in keyof O]: K extends `${string}?` ? O[K] | undefined : O[K] }

// https://github.com/Microsoft/TypeScript/issues/25760#issuecomment-705137615
type SetKeysOptional<O extends object> = Omit<O, KeysEndingInQuestionMark<O>> & Partial<O>

type KeysEndingInQuestionMark<O extends object> = { [K in keyof O]: K extends `${any}?` ? K : never }[keyof O]

type RemoveQuestionMarkFromKeys<O extends object> = { [K in keyof O as K extends `${infer K2}?` ? K2 : K]: O[K] }

type InferObject<O extends object> = { [K in keyof O]: Infer<O[K]> }

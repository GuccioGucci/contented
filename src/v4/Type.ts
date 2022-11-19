import { IsTypeOf, Narrow, Any, Expand, Not, Every, ExtendsObject } from '../_typefunc'

// Type<R> is an interface because the user need not know what constitues a Type<R> (IntelliSense does not expand interfaces)
export interface Type<R> {
  schema: Schema<R>
}

export type Infer<T> = T extends Type<infer R> ? R : never

export type Schema<R> = Primitive | Match<R> | Object_

// ======================================================================
// Primitive
// ======================================================================
export type Primitive = 'string' | 'boolean' | 'number'

export function isPrimitive<R>(schema: Schema<R>): schema is Primitive {
  return schema === 'string' || schema === 'boolean' || schema === 'number'
}

export type IsPrimitive<R> = Any<[IsTypeOf<R, string>, IsTypeOf<R, boolean>, IsTypeOf<R, number>]>

// ======================================================================
// Match
// ======================================================================
export type Match<R> = { match: R }

export function isMatch<R>(schema: Schema<R>): schema is Match<R> {
  return typeof schema === 'object' && 'match' in schema
}

// ======================================================================
// Object
// ======================================================================
export type Object_ = { object: Record<string, Schema<unknown>> }

export type IsObject<R> = Every<[Not<IsPrimitive<R>>, ExtendsObject<R>]>

// ======================================================================
// Programs
// ======================================================================
export const string: Type<string> = { schema: 'string' }

export const number: Type<number> = { schema: 'number' }

export const boolean: Type<boolean> = { schema: 'boolean' }

export function match<R extends string | number | boolean>(match: Narrow<R>): Type<Narrow<R>> {
  return { schema: { match } }
}

export function object<O extends Record<string, Type<unknown>>>(obj: O): Type<SequenceObject<O>> {
  const object: Record<string, Schema<unknown>> = {}
  for (const [key, type] of Object.entries(obj)) {
    object[key] = type.schema
  }

  return { schema: { object } }
}

type SequenceObject<O extends {}> = Expand<
  InferObject<RemoveQuestionMarkFromKeys<SetKeysOptional<SetValuesOptional<O>>>>
>

type SetValuesOptional<O extends {}> = { [K in keyof O]: K extends `${string}?` ? O[K] | undefined : O[K] }

// https://github.com/Microsoft/TypeScript/issues/25760#issuecomment-705137615
type SetKeysOptional<O extends {}> = Omit<O, KeysEndingInQuestionMark<O>> & Partial<O>

type KeysEndingInQuestionMark<O extends {}> = { [K in keyof O]: K extends `${any}?` ? K : never }[keyof O]

type RemoveQuestionMarkFromKeys<O extends {}> = { [K in keyof O as K extends `${infer K2}?` ? K2 : K]: O[K] }

type InferObject<O extends {}> = { [K in keyof O]: Infer<O[K]> }

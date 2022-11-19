import { IsTypeOf, Narrow, Any } from '../_typefunc'

// Type<R> is an interface because the user need not know what constitues a Type<R> (IntelliSense does not expand interfaces)
export interface Type<R> {
  schema: Schema<R>
}

export type Schema<R> = Primitive | Match<R>

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

// ======================================================================
// Programs
// ======================================================================
export const string: Type<string> = { schema: 'string' }

export const number: Type<number> = { schema: 'number' }

export const boolean: Type<boolean> = { schema: 'boolean' }

export function match<R extends string | number | boolean>(match: Narrow<R>): Type<Narrow<R>> {
  return { schema: { match } }
}

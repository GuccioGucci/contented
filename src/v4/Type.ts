import { Narrow } from '../_typefunc'

// Type<E> is an interface because the user need not know what constitues a Type<E> (IntelliSense does not expand interfaces)
export interface Type<E> {
  schema: Schema<E>
}

export type Schema<E> = Primitive | Match<E>

// ======================================================================
// Primitive
// ======================================================================
export type Primitive = 'string' | 'boolean' | 'number'

export function isPrimitive<E>(schema: Schema<E>): schema is Primitive {
  return schema === 'string' || schema === 'boolean' || schema === 'number'
}

// ======================================================================
// Match
// ======================================================================
export type Match<E> = { match: E }

// ======================================================================
// Programs
// ======================================================================
export const string: Type<string> = { schema: 'string' }

export const number: Type<number> = { schema: 'number' }

export const boolean: Type<boolean> = { schema: 'boolean' }

export function match<E extends string | number | boolean>(match: Narrow<E>): Type<Narrow<E>> {
  return { schema: { match } }
}

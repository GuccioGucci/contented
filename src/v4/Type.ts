import { Narrow } from '../_typefunc'

// Type<E> is an interface because the user need not know what constitues a Type<E> (IntelliSense does not expand interfaces)
export interface Type<E> {
  to: Primitive | Match<E>
}

// ======================================================================
// Primitive
// ======================================================================
export type Primitive = typeof PRIMITIVES[number]

export function isPrimitive(to: any): to is Primitive {
  return PRIMITIVES.includes(to)
}

const PRIMITIVES = ['string', 'number', 'boolean'] as const

// ======================================================================
// Match
// ======================================================================
export type Match<E> = { match: E }

// ======================================================================
// Programs
// ======================================================================
export const string: Type<string> = { to: 'string' }

export const number: Type<number> = { to: 'number' }

export const boolean: Type<boolean> = { to: 'boolean' }

export function match<E extends string | number | boolean>(match: Narrow<E>): Type<Narrow<E>> {
  return { to: { match } }
}

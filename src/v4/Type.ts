import { Narrow } from '../_typefunc'

// Type<E> is an interface because the user need not know what constitues a Type<E> (IntelliSense does not expand interfaces)
export interface Type<E> {
  to: Primitive | Match<E>
}

export type Primitive = typeof PRIMITIVES[number]

export type Match<E> = { match: E }

export const string: Type<string> = { to: 'string' }

export const number: Type<number> = { to: 'number' }

export const boolean: Type<boolean> = { to: 'boolean' }

export function match<E extends string | number | boolean>(match: Narrow<E>): Type<Narrow<E>> {
  return { to: { match } }
}

export function isPrimitive(to: any): to is Primitive {
  return PRIMITIVES.includes(to)
}

const PRIMITIVES = ['string', 'number', 'boolean'] as const

import { InvalidCoercion } from '../InvalidCoercion'
import { Type, Primitive, Match, isPrimitive } from './Type'

export function coerceTo<E>(type: Type<E>, value: any): E | InvalidCoercion {
  const { to } = type
  return coerce(to, value) as E | InvalidCoercion
}

function coerce<E>(to: Primitive | Match<E>, value: any) {
  if (isPrimitive(to)) {
    return coercePrimitive(to, value)
  }
  return to.match === value ? value : new InvalidCoercion(`${to.match}`, value)
}

function coercePrimitive(to: Primitive, value: any) {
  return typeof value === to ? value : new InvalidCoercion(to, value)
}

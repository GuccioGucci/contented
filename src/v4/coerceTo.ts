import { InvalidCoercion } from '../InvalidCoercion'
import { Type, To } from './Type'

export function coerceTo<E>(type: Type<E>, value: any): E | InvalidCoercion {
  const { to } = type
  return coerce(to, value) as E | InvalidCoercion
}

function coerce(to: To, value: any) {
  return typeof value === to ? value : new InvalidCoercion(to, value)
}

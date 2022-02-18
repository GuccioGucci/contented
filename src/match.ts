import { Coerce, Type } from './Type'
import { InvalidCoercion } from './InvalidCoercion'
import { Narrow } from './_typefunc'

export function match<T extends string | number | bigint | boolean>(expected: Narrow<T>) {
  type CoerceMatch = Coerce<T, InvalidCoercion>

  const coerce: CoerceMatch = (value: any) => {
    if (value === expected) {
      return value
    }

    return new InvalidCoercion(`${expected}`, value)
  }

  return new Type(coerce)
}

import { Coerce, Type } from './Type'
import { InvalidCoercion } from './InvalidCoercion'
import { Narrow } from './_typefunc'

export function match<T extends string | number | bigint | boolean>(expected: Narrow<T>): Type<T, InvalidCoercion> {
  const coerce: Coerce<T, InvalidCoercion> = (value: any) => {
    if (value === expected) {
      return value
    }

    return new InvalidCoercion(`${expected}`, value)
  }

  return new Type(coerce)
}

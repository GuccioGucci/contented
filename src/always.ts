import { InvalidCoercion } from './InvalidCoercion'
import { Coerce, Type } from './Type'

export function always<T>(value: Narrow<T>): Type<T, never> {
  return new Type<T, never>((_: any) => value as T)
}

export function match<T extends string | number | bigint | boolean>(
  expected: Narrow<T>
): Type<T, InvalidCoercion> {
  const coerce: Coerce<T, InvalidCoercion> = (value: any) => {
    if (value === expected) {
      return value
    }

    return new InvalidCoercion(`${expected}`, value)
  }

  return new Type(coerce)
}

type Narrow<A> =
  | (A extends [] ? [] : never)
  | (A extends string | number | bigint | boolean ? A : never)
  | {
      [K in keyof A]: A[K] extends Function ? A[K] : Narrow<A[K]>
    }

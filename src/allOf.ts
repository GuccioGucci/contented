import { Infer, Type } from './Type'

export function allOf<T1 extends Type<unknown>, T2 extends Type<unknown>, Ts extends Type<unknown>[]>(
  first: T1,
  second: T2,
  ...rest: Ts
): Type<AllOf<[T1, T2, ...Ts]>> {
  const allOf = [first, second, ...rest].map((type) => type.schema)
  return { schema: { allOf } }
}

type AllOf<Types, P = unknown, O = unknown> = Types extends [infer Head, ...infer Rest]
  ? Infer<Head> extends object
    ? AllOf<Rest, P, Infer<Head> & O>
    : AllOf<Rest, Infer<Head> & P, O>
  : P & PrettifyObj<O>
type PrettifyObj<T> = {
  [K in keyof T]: T[K]
} & {}

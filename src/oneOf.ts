import { Infer, Type } from './Type'

export function oneOf<T1 extends Type<unknown>, T2 extends Type<unknown>, Ts extends Type<unknown>[]>(
  first: T1,
  second: T2,
  ...rest: Ts
): Type<OneOf<[T1, T2, ...Ts]>> {
  const oneOf = [first, second, ...rest].map((type) => type.schema)
  return { schema: { oneOf } }
}

type OneOf<Types> = Types extends [infer Head, ...infer Rest] ? Infer<Head> | OneOf<Rest> : never

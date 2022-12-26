import { Type } from './Type'

export function literal<R extends string | number | boolean>(value: Narrow<R>): Type<Narrow<R>> {
  return { schema: { literal: value } }
}

type Narrow<A> =
  | (A extends [] ? [] : never)
  | (A extends string | number | boolean ? A : never)
  | {
      [K in keyof A]: A[K] extends Function ? A[K] : Narrow<A[K]>
    }

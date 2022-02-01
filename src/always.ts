import { Type } from './Type'

export function always<T>(value: Narrow<T>): Type<T, never> {
  return new Type<T, never>((_: any) => value as T)
}

type Narrow<A> =
  | (A extends [] ? [] : never)
  | (A extends Narrowable ? A : never)
  | {
      [K in keyof A]: A[K] extends Function ? A[K] : Narrow<A[K]>
    }

type Narrowable = string | number | bigint | boolean

import { Type } from '../Type'
import { ContentedError } from './ContentedError'

export function hasNonFatalErrors(
  res: any
): res is [unknown, ContentedError[]] {
  return (
    Array.isArray(res) &&
    res.length == 2 &&
    res[1].every((err: any) => err instanceof ContentedError)
  )
}

type NonFatalErrorType<T> = T extends Type<infer A, any>
  ? HasNonFatalErrorTypes<A> extends true
    ? _NonFatalErrorTypes<A>
    : never
  : never

export type NonFatalErrorTypes<Ts> = Ts extends [infer Head, ...infer Tail]
  ? [NonFatalErrorType<Head>, ...NonFatalErrorTypes<Tail>]
  : []

type IsUnion<T> = [T] extends [UnionToIntersection<T>] ? false : true

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I
) => void
  ? I
  : never

export type _NonFatalErrorTypes<T> = T extends [any, infer NFs]
  ? NFs extends (infer NF)[]
    ? NF extends ContentedError
      ? NF
      : never
    : never
  : never
export type HasNonFatalErrorTypes<T> = And<
  IsUnion<T>,
  _Has<_NonFatalErrorTypes<T>>
>

type And<T1 extends boolean, T2 extends boolean> = T1 extends true ? T2 : false

// https://github.com/microsoft/TypeScript/issues/23182#issuecomment-379091887
type _Has<T> = [T] extends [never] ? false : true

export type TypeInFatalErrorTypes<T> = T extends [infer U, infer NFs]
  ? NFs extends (infer NF)[]
    ? NF extends ContentedError
      ? U
      : never
    : never
  : never

import { ContentedError } from './ContentedError'
import { Joint } from './Joint'
import { Has, IsUnion } from './_typefunc'

export class Type<T, E> {
  #coerce: Coerce<T, E>

  constructor(coerce: Coerce<T, E>) {
    this.#coerce = coerce
  }

  static coerceTo<T, E extends ContentedError>(type: Type<T, E>, value: any) {
    return type.#coerce(value)
  }

  or<U, F>(that: Type<U, F>): Type<T | U, OrErrors<E, F>> {
    const coerce: Coerce<T | U, OrErrors<E, F>> = (value) => {
      const res1 = this.#coerce(value)
      if (!(res1 instanceof ContentedError)) {
        return res1 as T
      }
      const res2 = that.#coerce(value)
      if (!(res2 instanceof ContentedError)) {
        return res2 as U
      }
      return Joint.of(res1, res2) as unknown as OrErrors<E, F>
    }

    return new Type(coerce)
  }
}

export const coerceTo = Type.coerceTo

export type Coerce<T, E> = (value: any) => T | E

export type NonFatalErrorType<T> = T extends Type<infer A, any>
  ? NonFatalErrorType<A>
  : IsUnion<T> extends true
  ? T extends [any, (infer NF)[]]
    ? NF extends ContentedError
      ? NF
      : never
    : never
  : never

export type HasNonFatalErrors<T> = Has<NonFatalErrorType<T>>

export type ExpectedType<T> = T extends Type<infer A, any>
  ? ExpectedType<A>
  : HasNonFatalErrors<T> extends true
  ? T extends [infer U, any]
    ? U
    : never
  : T

type OrErrors<E, F> = EnumerateErrors<StripJoint<E>, StripJoint<F>> extends never
  ? never
  : Joint<EnumerateErrors<StripJoint<E>, StripJoint<F>>>

type EnumerateErrors<E, F> = E extends never
  ? never
  : F extends never
  ? never
  : E extends unknown[]
  ? F extends unknown[]
    ? [...E, ...F]
    : [...E, F]
  : F extends unknown[]
  ? [E, ...F]
  : [E, F]

type StripJoint<T> = T extends Joint<infer U> ? U : T

export function hasNonFatalErrors(res: any): res is [unknown, ContentedError[]] {
  return Array.isArray(res) && res.length == 2 && res[1].every((err: any) => err instanceof ContentedError)
}

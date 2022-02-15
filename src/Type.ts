import { ContentedError } from './ContentedError'

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

export class Joint<E extends unknown[]> extends ContentedError {
  constructor(public readonly errors: E) {
    super()
  }

  static of<E, F>(err1: E, err2: F) {
    if (err1 instanceof Joint && err2 instanceof Joint) {
      return new Joint([...err1.errors, err2.errors])
    }
    if (err1 instanceof Joint) {
      return new Joint([...err1.errors, err2])
    }
    if (err2 instanceof Joint) {
      return new Joint([err1, ...err2.errors])
    }
    return new Joint([err1, err2])
  }
}

type OrErrors<E, F> = EnumerateErrors<
  StripJoint<E>,
  StripJoint<F>
> extends never
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

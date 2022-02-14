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
      const res = this.#coerce(value)
      if (res instanceof ContentedError) {
        return that.#coerce(value) as T | U | OrErrors<E, F>
      }
      return res as T | U | OrErrors<E, F>
    }

    return new Type(coerce)
  }
}

export const coerceTo = Type.coerceTo

export type Coerce<T, E> = (value: any) => T | E

type OrErrors<E, F> = E extends never ? never : F extends never ? never : E | F

import { ContentedError } from './ContentedError'

export class Type<T, E> {
  constructor(private readonly coerce: Coerce<T, E>) {}

  static coerceTo<T, E extends ContentedError>(type: Type<T, E>, value: any) {
    return type.coerce(value)
  }
}

export const coerceTo = Type.coerceTo

export type Coerce<T, E> = (value: any) => T | E

import { ContentedError } from './ContentedError'

export abstract class Type<T, E> {
  static coerceTo<T, E extends ContentedError>(type: Type<T, E>, value: any) {
    return type.coerce(value)
  }

  protected abstract coerce(value: any): T | E
}

export const coerceTo = Type.coerceTo

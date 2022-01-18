import { ContentedError } from './ContentedError'

export abstract class To<T, E> {
  static coerceTo<T, E extends ContentedError>(to: To<T, E>, value: any) {
    return to.coerceTo(value)
  }

  protected abstract coerceTo(value: any): T | E
}

export const coerceTo = To.coerceTo

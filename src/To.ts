export abstract class To<T, E> {
  static coerce<T, E>(to: To<T, E>, value: any) {
    return to.coerce(value)
  }

  protected abstract coerce(value: any): T | E
}

export const coerce = To.coerce

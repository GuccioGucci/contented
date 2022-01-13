export abstract class As<T, E> {
  static as<T, E>(asT: As<T, E>, value: any) {
    return asT.coerce(value)
  }

  protected abstract coerce(value: any): T | E
}

export const as = As.as

export class InvalidCoercion {
  constructor(public readonly expected: Expected, public readonly got: any) {}
}

type Expected = 'string' | 'number' | 'boolean'

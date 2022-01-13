abstract class As<T> {
  static as<T>(asT: As<T>, value: any) {
    return asT.from(value)
  }

  protected abstract from(value: any): T | InvalidCoercion
}

export const as = As.as

class AsString extends As<string> {
  protected from(value: any) {
    if (typeof value !== 'string') {
      return new InvalidCoercion('string', value)
    }
    return value
  }
}

class AsBoolean extends As<boolean> {
  protected from(value: any) {
    if (typeof value !== 'boolean') {
      return new InvalidCoercion('boolean', value)
    }
    return value
  }
}

class AsNumber extends As<number> {
  protected from(value: any) {
    if (typeof value !== 'number') {
      return new InvalidCoercion('number', value)
    }
    return value
  }
}

export const string: As<string> = new AsString()
export const boolean: As<boolean> = new AsBoolean()
export const number: As<number> = new AsNumber()

export class InvalidCoercion {
  constructor(public readonly expected: Expected, public readonly got: any) {}
}

type Expected = 'string' | 'number' | 'boolean'

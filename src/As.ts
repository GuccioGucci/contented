interface As<T> {
  from(value: any): T | InvalidCoercion
}

class AsString implements As<string> {
  from(value: any) {
    if (typeof value !== 'string') {
      return new InvalidCoercion('string', value)
    }
    return value
  }
}

class AsBoolean implements As<boolean> {
  from(value: any) {
    if (typeof value !== 'boolean') {
      return new InvalidCoercion('boolean', value)
    }
    return value
  }
}

class AsNumber implements As<number> {
  from(value: any) {
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

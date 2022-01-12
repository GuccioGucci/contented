interface As<T> {
  from(value: any): T | AsError
}

class AsString implements As<string> {
  from(value: any) {
    if (typeof value !== 'string') {
      return new AsError('string', value)
    }
    return value
  }
}

class AsBoolean implements As<boolean> {
  from(value: any) {
    if (typeof value !== 'boolean') {
      return new AsError('boolean', value)
    }
    return value
  }
}

class AsNumber implements As<number> {
  from(value: any) {
    if (typeof value !== 'number') {
      return new AsError('number', value)
    }
    return value
  }
}

export const string: As<string> = new AsString()
export const boolean: As<boolean> = new AsBoolean()
export const number: As<number> = new AsNumber()

export class AsError {
  constructor(public readonly expected: Expected, public readonly got: any) {}
}

type Expected = 'string' | 'number' | 'boolean'

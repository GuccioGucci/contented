import { MissingKey } from './Property'

abstract class As<T, E> {
  static as<T, E>(asT: As<T, E>, value: any) {
    return asT.coerce(value)
  }

  protected abstract coerce(value: any): T | E
}

export type { As }
export const as = As.as

class AsString extends As<string, InvalidCoercion> {
  protected coerce(value: any) {
    if (typeof value !== 'string') {
      return new InvalidCoercion('string', value)
    }
    return value
  }
}

class AsBoolean extends As<boolean, InvalidCoercion> {
  protected coerce(value: any) {
    if (typeof value !== 'boolean') {
      return new InvalidCoercion('boolean', value)
    }
    return value
  }
}

class AsNumber extends As<number, InvalidCoercion> {
  protected coerce(value: any) {
    if (typeof value !== 'number') {
      return new InvalidCoercion('number', value)
    }
    return value
  }
}

export const string: As<string, InvalidCoercion> = new AsString()
export const boolean: As<boolean, InvalidCoercion> = new AsBoolean()
export const number: As<number, InvalidCoercion> = new AsNumber()

export function at<T, E>(path: Path, asT: As<T, E>): As<T, E | MissingKey> {
  return new (class extends As<T, E | MissingKey> {
    protected coerce(value: any): T | E | MissingKey {
      let curr: any = value
      for (const [key, pos] of enumerate(path)) {
        if (curr?.[key] === undefined) {
          return new MissingKey(path.slice(0, pos + 1))
        }
        curr = curr[key]
      }
      return as(asT, curr)
    }
  })()
}

type Key = string | symbol | number
type Path = Key[]

export class InvalidCoercion {
  constructor(public readonly expected: Expected, public readonly got: any) {}
}

type Expected = 'string' | 'number' | 'boolean'

function* enumerate<T>(xs: T[]) {
  for (let i = 0; i < xs.length; i++) {
    yield [xs[i], i] as const
  }
}

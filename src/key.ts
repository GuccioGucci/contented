import { ContentedError } from './ContentedError'
import { To, coerce } from './To'

export function at<T, E extends ContentedError>(
  path: Path,
  to: To<T, E>
): To<T, AtKey<E> | MissingKey> {
  return new (class extends To<T, AtKey<E> | MissingKey> {
    protected coerce(value: any): T | AtKey<E> | MissingKey {
      let curr: any = value
      for (const [key, pos] of enumerate(path)) {
        if (curr?.[key] === undefined) {
          return new MissingKey(path.slice(0, pos + 1))
        }
        curr = curr[key]
      }
      const res = coerce(to, curr)
      if (res instanceof ContentedError) {
        return new AtKey(path, res)
      }
      return res
    }
  })()
}

export function fallback<T, E extends ContentedError>(
  to: To<T, Has<E, MissingKey, 'Must include MissingKey'>>,
  fallback: T
): To<T, Exclude<E, MissingKey>> {
  return new (class extends To<T, Exclude<E, MissingKey>> {
    protected coerce(value: any): T | Exclude<E, MissingKey> {
      const res = coerce(to, value)
      if (res instanceof MissingKey) {
        return fallback
      }
      return res as T | Exclude<E, MissingKey>
    }
  })()
}

type Has<U extends any, U1 extends any, Msg extends string> = [U1] extends [U]
  ? U
  : Msg

export class MissingKey extends ContentedError {
  constructor(public readonly at: Path) {
    super()
  }
}

export class AtKey<E> extends ContentedError {
  constructor(public readonly at: Path, public readonly error: E) {
    super()
  }
}

type Key = string | symbol | number
type Path = Key[]

function* enumerate<T>(xs: T[]) {
  for (let i = 0; i < xs.length; i++) {
    yield [xs[i], i] as const
  }
}

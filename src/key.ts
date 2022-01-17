import { ContentedError } from './ContentedError'
import { enumerate } from './enumerate'
import { To, coerce } from './To'

export function at<T, E extends ContentedError>(
  path: Path,
  to: To<T, E>
): To<T, MissingKey | AtKey<InnerMostError<E>>> {
  return new (class extends To<T, MissingKey | AtKey<InnerMostError<E>>> {
    protected coerce(value: any): T | MissingKey | AtKey<InnerMostError<E>> {
      let curr: any = value
      for (const [key, pos] of enumerate(path)) {
        if (curr?.[key] === undefined) {
          return new MissingKey(path.slice(0, pos + 1))
        }
        curr = curr[key]
      }
      const res = coerce(to, curr)
      if (res instanceof ContentedError) {
        if (res instanceof AtKey) {
          return new AtKey(path.concat(res.at), res.error)
        }
        if (res instanceof MissingKey) {
          return new MissingKey(path.concat(res.at))
        }
        return new AtKey(path, res) as AtKey<InnerMostError<E>>
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

const AT_KEY = Symbol()
const MISSING_KEY = Symbol()

export class MissingKey extends ContentedError {
  // @ts-ignore
  private readonly missingKey: symbol

  constructor(public readonly at: Path) {
    super()
    this.missingKey = MISSING_KEY
  }
}

export class AtKey<E extends ContentedError> extends ContentedError {
  // @ts-ignore
  private readonly atKey: symbol

  constructor(public readonly at: Path, public readonly error: E) {
    super()
    this.atKey = AT_KEY
  }
}

type Key = string | symbol | number
type Path = Key[]

type InnerMostError<E extends ContentedError> = E extends AtKey<infer U>
  ? InnerMostError<U>
  : Exclude<E, MissingKey>

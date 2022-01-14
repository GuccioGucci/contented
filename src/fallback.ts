import { To, coerce } from './To'
import { MissingKey } from './at'

export function fallback<T, E>(
  to: To<T, Has<E, MissingKey, 'Must include MissingKey'>>,
  fallback: T
): To<T, Exclude<E, MissingKey>> {
  return new (class extends To<T, Exclude<E, MissingKey>> {
    protected coerce(value: any): T | Exclude<E, MissingKey> {
      const res = coerce(value, to)
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

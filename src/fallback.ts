import { As, as } from './As'
import { MissingKey } from './at'

export function fallback<T, E>(
  asT: As<T, Has<E, MissingKey, 'Must include MissingKey'>>,
  fallback: T
): As<T, Exclude<E, MissingKey>> {
  return new (class extends As<T, Exclude<E, MissingKey>> {
    protected coerce(value: any): T | Exclude<E, MissingKey> {
      const res = as(asT, value)
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

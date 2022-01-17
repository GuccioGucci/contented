import { ContentedError } from './ContentedError'
import { enumerate } from './enumerate'
import { InvalidCoercion } from './InvalidCoercion'
import { AtKey, MissingKey } from './key'
import { To, coerce } from './To'

export function many<T, E extends ContentedError>(
  to: To<T, E>
): To<T[], AtKey<InnerMostError<E>> | HasMissingKey<E> | InvalidCoercion> {
  return new (class extends To<
    T[],
    AtKey<InnerMostError<E>> | HasMissingKey<E> | InvalidCoercion
  > {
    protected coerce(value: any) {
      if (!Array.isArray(value)) {
        return new InvalidCoercion('array', value)
      }
      const res = []
      for (const [el, pos] of enumerate(value)) {
        const c = scope<T, E>(pos, coerce(to, el))
        if (c instanceof ContentedError) {
          return c
        }
        res.push(c)
      }
      return res
    }
  })()
}

function scope<T, E extends ContentedError>(
  at: number,
  value: T | E
): T | AtKey<InnerMostError<E>> | HasMissingKey<E> {
  if (value instanceof ContentedError) {
    if (value instanceof AtKey) {
      return new AtKey([at, ...value.at], value.error)
    }
    if (value instanceof MissingKey) {
      return new MissingKey([at, ...value.at]) as HasMissingKey<E>
    }
    return new AtKey([at], value) as AtKey<InnerMostError<E>>
  }
  return value
}

type InnerMostError<E extends ContentedError> = E extends AtKey<infer U>
  ? InnerMostError<U>
  : Exclude<E, MissingKey>

type HasMissingKey<E> = [MissingKey] extends [E] ? MissingKey : never

import { ContentedError } from './ContentedError'
import { Coerce, coerceTo, ExpectedType, Type } from './Type'

export function fallback<T, E extends ContentedError>(type: Type<T, E>, fallback: Fallback<T>) {
  type CoerceFallback = Coerce<Fallback<T>, E>

  const coerce: CoerceFallback = (value: any) => {
    const res = coerceTo(type, value)
    if (res === undefined) {
      return fallback as Fallback<T>
    }
    return res as Fallback<T>
  }

  return new Type(coerce)
}

type Fallback<T> = Exclude<ExpectedType<T>, undefined>

import { HasNonFatalErrorTypes, TypeInFatalErrorTypes } from './error/NonFatalErrorType'
import { ContentedError } from './error/ContentedError'
import { Coerce, coerceTo, Type } from './Type'
import { MissingKey } from './error/MissingKey'

export function fallback<T, E extends ContentedError>(type: Type<T, IncludesMissingKey<E>>, fallback: Fallback<T>) {
  type CoerceFallback = Coerce<T, Exclude<E, MissingKey>>

  const coerce: CoerceFallback = (value: any) => {
    const res = coerceTo(type as Type<T, E>, value)
    if (res instanceof MissingKey) {
      return fallback
    }
    return res as T | Exclude<E, MissingKey>
  }

  return new Type(coerce)
}

type IncludesMissingKey<E extends any> = [MissingKey] extends [E] ? E : 'Must include MissingKey'

type Fallback<T> = HasNonFatalErrorTypes<T> extends true ? TypeInFatalErrorTypes<T> : T

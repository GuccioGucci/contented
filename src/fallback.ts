import {
  HasNonFatalErrorTypes,
  TypeInFatalErrorTypes,
} from './error/NonFatalErrorType'
import { ContentedError } from './error/ContentedError'
import { Coerce, coerceTo, Type } from './Type'
import { MissingKey } from './error/MissingKey'

export function fallback<T, E extends ContentedError>(
  type: Type<T, Has<E, MissingKey, 'Must include MissingKey'>>,
  fallback: Fallback<T>
): Type<T, Exclude<E, MissingKey>> {
  type FallbackError = Exclude<E, MissingKey>

  const coerce: Coerce<T, FallbackError> = (value: any) => {
    const res = coerceTo(type as Type<T, E>, value)
    if (res instanceof MissingKey) {
      return fallback
    }
    return res as T | Exclude<E, MissingKey>
  }

  return new Type(coerce)
}

type Has<U extends any, U1 extends any, Msg extends string> = [U1] extends [U]
  ? U
  : Msg

type Fallback<T> = HasNonFatalErrorTypes<T> extends true
  ? TypeInFatalErrorTypes<T>
  : T

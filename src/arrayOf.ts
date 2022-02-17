import { ContentedError } from './error/ContentedError'
import { Coerce, coerceTo, Type } from './Type'
import {
  HasAtKeyInvalidCoercion,
  InvalidCoercion,
} from './error/InvalidCoercion'
import { enumerate } from './enumerate'
import { scope } from './error/scope'
import {
  _NonFatalErrorTypes,
  hasNonFatalErrors,
  HasNonFatalErrorTypes,
  TypeInFatalErrorTypes,
} from './error/NonFatalErrorType'
import { HasMissingKey } from './error/MissingKey'
import { HasJointAtKey } from './error/Joint'

export function arrayOf<T, E extends ContentedError>(
  type: Type<T, E>
): Type<
  ArrayOf<T>,
  | InvalidCoercion
  | HasMissingKey<E>
  | HasAtKeyInvalidCoercion<E>
  | HasJointAtKey<E>
> {
  type ArrayOfError =
    | InvalidCoercion
    | HasMissingKey<E>
    | HasAtKeyInvalidCoercion<E>
    | HasJointAtKey<E>

  const coerce: Coerce<ArrayOf<T>, ArrayOfError> = (value: any) => {
    if (!Array.isArray(value)) {
      return new InvalidCoercion('array', value)
    }

    const res = []
    const nonFatal = []
    let nonFatalErrors = false
    for (const [el, pos] of enumerate(value)) {
      const c = coerceTo(type, el)
      if (c instanceof ContentedError) {
        return scope([pos], c)
      } else if (hasNonFatalErrors(c)) {
        nonFatalErrors = true
        res.push(c[0])
        nonFatal.push(...c[1].map((err: ContentedError) => scope([pos], err)))
      } else {
        res.push(c)
      }
    }
    if (nonFatalErrors) {
      return [res, nonFatal] as ArrayOf<T>
    }
    return res as ArrayOf<T>
  }

  return new Type(coerce)
}

// ==============================================
// Type-level functions for arrayOf()
// ==============================================
type ArrayOf<T> = HasNonFatalErrorTypes<T> extends true
  ?
      | TypeInFatalErrorTypes<T>[]
      | [TypeInFatalErrorTypes<T>[], _NonFatalErrorTypes<T>[]]
  : T[]

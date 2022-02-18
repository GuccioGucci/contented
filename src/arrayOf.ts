import { ContentedError } from './ContentedError'
import { Coerce, coerceTo, ExpectedType, hasNonFatalErrors, HasNonFatalErrors, NonFatalErrorType, Type } from './Type'
import { enumerate } from './_enumerate'
import { _scope } from './_scope'
import { HasMissingKey } from './MissingKey'
import { HasJointAtKey } from './Joint'
import { HasAtKeyInvalidCoercion, InvalidCoercion } from './InvalidCoercion'

export function arrayOf<T, E extends ContentedError>(type: Type<T, E>) {
  type CoerceArrayOf = Coerce<
    ArrayOf<T>,
    InvalidCoercion | HasMissingKey<E> | HasAtKeyInvalidCoercion<E> | HasJointAtKey<E>
  >

  const coerce: CoerceArrayOf = (value: any) => {
    if (!Array.isArray(value)) {
      return new InvalidCoercion('array', value)
    }

    const res = []
    const nonFatal = []
    let nonFatalErrors = false
    for (const [el, pos] of enumerate(value)) {
      const c = coerceTo(type, el)
      if (c instanceof ContentedError) {
        return _scope([pos], c)
      } else if (hasNonFatalErrors(c)) {
        nonFatalErrors = true
        res.push(c[0])
        nonFatal.push(...c[1].map((err: ContentedError) => _scope([pos], err)))
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

type ArrayOf<T> = HasNonFatalErrors<T> extends true
  ? ExpectedType<T>[] | [ExpectedType<T>[], NonFatalErrorType<T>[]]
  : T[]

import {
  _NonFatalErrorTypes,
  hasNonFatalErrors,
  HasNonFatalErrorTypes,
  TypeInFatalErrorTypes,
} from './error/NonFatalErrorType'
import { ContentedError } from './error/ContentedError'
import { Coerce, coerceTo, Type } from './Type'
import {
  HasAtKeyInvalidCoercion,
  InvalidCoercion,
} from './error/InvalidCoercion'
import { enumerate } from './enumerate'
import { scope } from './error/scope'
import { HasMissingKey } from './error/MissingKey'
import { HasJointAtKey } from './error/Joint'

export function permissiveArrayOf<T, E extends ContentedError>(
  type: Type<T, E>
): Type<PermissiveArrayOf<T, E>, InvalidCoercion> {
  const coerce: Coerce<PermissiveArrayOf<T, E>, InvalidCoercion> = (
    value: any
  ) => {
    if (!Array.isArray(value)) {
      return new InvalidCoercion('array', value)
    }
    const res = []
    const errs = []
    for (const [el, pos] of enumerate(value)) {
      const c = coerceTo(type, el)
      if (c instanceof ContentedError) {
        errs.push(scope([pos], c))
        continue
      } else if (hasNonFatalErrors(c)) {
        res.push(c[0])
        errs.push(...c[1].map((err: ContentedError) => scope([pos], err)))
      } else {
        res.push(c)
      }
    }
    if (errs.length === 0) {
      return res as PermissiveArrayOf<T, E>
    }
    return [res, errs] as PermissiveArrayOf<T, E>
  }

  return new Type(coerce)
}

type PermissiveArrayOf<T, E> = HasNonFatalErrorTypes<T> extends true
  ?
      | TypeInFatalErrorTypes<T>[]
      | [
          TypeInFatalErrorTypes<T>[],
          (
            | HasAtKeyInvalidCoercion<E>
            | HasJointAtKey<E>
            | HasMissingKey<E>
            | _NonFatalErrorTypes<T>
          )[]
        ]
  :
      | HasAtKeyInvalidCoercion<E>
      | HasJointAtKey<E>
      | HasMissingKey<E> extends never
  ? T[]
  :
      | T[]
      | [
          T[],
          (HasAtKeyInvalidCoercion<E> | HasJointAtKey<E> | HasMissingKey<E>)[]
        ]

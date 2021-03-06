import { ContentedError } from './ContentedError'
import { Coerce, coerceTo, ExpectedType, hasNonFatalErrors, HasNonFatalErrors, NonFatalErrorType, Type } from './Type'
import { enumerate } from './_enumerate'
import { scope } from './_scope'
import { HasMissingKey } from './MissingKey'
import { HasJointAtKey } from './Joint'
import { HasAtKeyInvalidCoercion, InvalidCoercion } from './InvalidCoercion'

export function permissiveArrayOf<T, E extends ContentedError>(type: Type<T, E>) {
  type CoercePermissiveArrayOf = Coerce<PermissiveArrayOf<T, E>, InvalidCoercion>

  const coerce: CoercePermissiveArrayOf = (value: any) => {
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

type PermissiveArrayOf<T, E> = HasNonFatalErrors<T> extends true
  ? ExpectedType<T>[] | [ExpectedType<T>[], (HasAtKeyInvalidCoercion<E> | HasJointAtKey<E> | HasMissingKey<E> | NonFatalErrorType<T>)[]]
  : HasAtKeyInvalidCoercion<E> | HasJointAtKey<E> | HasMissingKey<E> extends never
    ? T[]
    : T[] | [T[], (HasAtKeyInvalidCoercion<E> | HasJointAtKey<E> | HasMissingKey<E>)[]]
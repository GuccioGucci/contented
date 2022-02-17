import { ContentedError } from './error/ContentedError'
import { Key, Path } from './Path'
import { Coerce, coerceTo, Type } from './Type'
import { MissingKey } from './error/MissingKey'
import { enumerate } from './_enumerate'
import { scope } from './error/scope'
import { HasJointAtKey } from './error/Joint'
import { HasAtKeyInvalidCoercion, InvalidCoercion } from './error/InvalidCoercion'
import { hasNonFatalErrors } from './error/NonFatalErrorType'

export function at<T, E extends ContentedError>(pathOrKey: Path | Key, type: Type<T, E>) {
  type CoerceAt = Coerce<T, MissingKey | InvalidCoercion | HasAtKeyInvalidCoercion<E> | HasJointAtKey<E>>

  const coerce: CoerceAt = (value: any) => {
    if (typeof value !== 'object') {
      return new InvalidCoercion('object', value)
    }

    const path: Path = [pathOrKey].flat()
    for (const [key, pos] of enumerate(path)) {
      if (value[key] === undefined) {
        const missingKey = path.slice(0, pos + 1)
        return new MissingKey(missingKey)
      }
      value = value[key]
    }

    const res = coerceTo(type, value)
    if (res instanceof ContentedError) {
      return scope(path, res)
    }
    if (hasNonFatalErrors(res)) {
      const [value, errors] = res
      return [value, errors.map((err: ContentedError) => scope(path, err))] as unknown as T
    }
    return res
  }

  return new Type(coerce)
}

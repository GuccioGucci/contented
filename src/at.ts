import { ContentedError } from './error/ContentedError'
import { Key, Path } from './Path'
import { Coerce, coerceTo, Type } from './Type'
import { MissingKey } from './error/MissingKey'
import { InvalidCoercion } from './error/InvalidCoercion'
import { enumerate } from './enumerate'
import { scope } from './error/scope'
import { HasAtKeyInvalidCoercion } from './error/AtKey'
import { HasJointAtKey } from './error/Joint'

export function at<T, E extends ContentedError>(
  pathOrKey: Key | Path,
  type: Type<T, E>
): Type<
  T,
  MissingKey | InvalidCoercion | HasAtKeyInvalidCoercion<E> | HasJointAtKey<E>
> {
  type AtError =
    | MissingKey
    | InvalidCoercion
    | HasAtKeyInvalidCoercion<E>
    | HasJointAtKey<E>

  const coerce: Coerce<T, AtError> = (value: any) => {
    if (typeof value !== 'object') {
      return new InvalidCoercion('object', value)
    }

    const path: Path = [pathOrKey].flatMap((x) => x)
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
    if (Array.isArray(res)) {
      const [value, errors] = res
      return [
        value,
        errors.map((err: ContentedError) => scope(path, err)),
      ] as unknown as T
    }
    return res
  }

  return new Type(coerce)
}

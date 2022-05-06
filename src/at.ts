import { ContentedError } from './ContentedError'
import { access, isOptional, Key, slicePath, Path } from './Path'
import { Coerce, coerceTo, hasNonFatalErrors, Type } from './Type'
import { MissingKey } from './MissingKey'
import { enumerate } from './_enumerate'
import { scope } from './_scope'
import { HasJointAtKey } from './Joint'
import { HasAtKeyInvalidCoercion, InvalidCoercion } from './InvalidCoercion'

export function at<T, E extends ContentedError, K extends Key>(pathOrKey: K, type: Type<T, E>): At<typeof type, [K]>
export function at<T, E extends ContentedError, P extends Path>(
  pathOrKey: [...P],
  type: Type<T, E>
): At<typeof type, [...P]>
export function at<T, E extends ContentedError, P extends Path, K extends Key>(
  pathOrKey: PathOrKey<P, K>,
  type: Type<T, E>
) {
  type CoerceAt = Coerce<
    PossiblyUndefined<T, P>,
    MissingKeyInPath<P> | InvalidCoercion | HasAtKeyInvalidCoercion<E> | HasJointAtKey<E>
  >

  const coerce: CoerceAt = (value: any) => {
    if (typeof value !== 'object') {
      return new InvalidCoercion('object', value)
    }

    const path = Array.isArray(pathOrKey) ? pathOrKey : [pathOrKey]
    for (const [key, pos] of enumerate(path)) {
      value = access(value, key)
      if (value === undefined) {
        if (isOptional(key)) {
          return undefined as PossiblyUndefined<T, P>
        } else {
          const missingKey = slicePath(path, pos)
          return new MissingKey(missingKey) as MissingKeyInPath<P>
        }
      }
    }

    const res = coerceTo(type, value)
    if (res instanceof ContentedError) {
      return scope(path, res) as HasAtKeyInvalidCoercion<E> | HasJointAtKey<E>
    }
    if (hasNonFatalErrors(res)) {
      const [value, errors] = res
      return [value, errors.map((err: ContentedError) => scope(path, err))] as unknown as T
    }
    return res
  }

  return new Type(coerce)
}

export type At<T, P = []> = T extends Type<infer R, infer E>
  ? Type<PossiblyUndefined<R, P>, MissingKeyInPath<P> | InvalidCoercion | HasAtKeyInvalidCoercion<E> | HasJointAtKey<E>>
  : never

type PathOrKey<P extends Path, K extends Key> = [...P] | K

type PossiblyUndefined<R, P> = SomeAreOptional<P> extends true ? R | undefined : R

type MissingKeyInPath<P> = AllAreOptional<P> extends true ? never : MissingKey

type SomeAreOptional<T, A = false> = A extends true
  ? A
  : T extends [infer Head, ...infer Tail]
  ? SomeAreOptional<Tail, IsOptional<Head>>
  : A

type AllAreOptional<T, A = true> = A extends false
  ? A
  : T extends [infer Head, ...infer Tail]
  ? AllAreOptional<Tail, IsOptional<Head>>
  : A

type IsOptional<T> = T extends `${any}?` ? true : false

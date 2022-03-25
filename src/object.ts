import { At } from './at'
import { ObjectOf, ErrorTypeInObject as ObjectOfError } from './combineIntoObject'
import { ContentedError } from './ContentedError'
import { InvalidCoercion } from './InvalidCoercion'
import { MissingKey } from './MissingKey'
import { Coerce, coerceTo, hasNonFatalErrors, Type } from './Type'
import { scope } from './_scope'

export function object<E extends ContentedError, O extends Record<string, Type<unknown, E>>>(obj: O) {
  type CoerceObject = Coerce<ObjectOf<AtInObject<O>>, InvalidCoercion | ObjectOfError<AtInObject<O>>>

  const coerce: CoerceObject = (value: any) => {
    if (typeof value !== 'object') {
      throw new InvalidCoercion('object', value)
    }

    const out: Record<string, unknown> = {}
    const nonFatals = []
    for (let key of Object.keys(obj)) {
      if (key.endsWith('?')) {
        key = key.slice(0, -1)
        if (!value.hasOwnProperty(key)) continue
        if (value[key] === undefined) {
          out[key] = undefined
          continue
        }
      }

      if (value[key] === undefined) {
        return new MissingKey([key]) as ObjectOfError<AtInObject<O>>
      }

      const type = obj[key] ?? obj[`${key}?`]
      const res = coerceTo(type, value[key])
      if (res instanceof ContentedError) {
        return scope([key], res) as ObjectOfError<AtInObject<O>>
      } else if (hasNonFatalErrors(res)) {
        const [value, errors] = res
        out[key] = value
        nonFatals.push(...errors.map((err: ContentedError) => scope([key], err)))
      } else {
        out[key] = res
      }
    }

    if (nonFatals.length > 0) {
      return [out, nonFatals] as ObjectOf<AtInObject<O>>
    }

    return out as ObjectOf<AtInObject<O>>
  }

  return new Type(coerce)
}

type AtInObject<O extends ObjectOfTypes> = {
  [K in keyof O]: K extends `${any}?` ? RemoveMissingKey<At<O[K]>> : At<O[K]>
}

type RemoveMissingKey<T> = [T] extends [Type<infer A, infer E>] ? Type<A, Exclude<E, MissingKey>> : never

type ObjectOfTypes = Record<string, Type<unknown, unknown>>

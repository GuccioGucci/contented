import { At } from './at'
import { ContentedError } from './ContentedError'
import { InvalidCoercion } from './InvalidCoercion'
import { MissingKey } from './MissingKey'
import { Coerce, coerceTo, ErrorType, ExpectedType, hasNonFatalErrors, NonFatalErrorType, Type } from './Type'
import { scope } from './_scope'
import { Expand } from './_typefunc'

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
  [K in keyof O]: At<O[K], [K]>
}

export type ObjectOf<O extends ObjectOfTypes> = IsWithoutNonFatalErrors<O> extends true
  ? Expand<EnforceOptionality<ExpectedTypeInObject<O>>>
  :
      | Expand<EnforceOptionality<ExpectedTypeInObject<O>>>
      | [Expand<EnforceOptionality<ExpectedTypeInObject<O>>>, NonFatalErrorTypeInObject<O>[]]

// `| never` is to force IntelliSense to expand the union type
type ObjectOfError<O extends ObjectOfTypes> = { [K in keyof O]: ErrorType<O[K]> }[keyof O] | never

type IsWithoutNonFatalErrors<O extends ObjectOfTypes> = NonFatalErrorTypeInObject<O> extends never ? true : false

type NonFatalErrorTypeInObject<O extends ObjectOfTypes> = { [K in keyof O]: NonFatalErrorType<O[K]> }[keyof O]

type ExpectedTypeInObject<O extends ObjectOfTypes> = { [K in keyof O]: ExpectedType<O[K]> }

type ObjectOfTypes = Record<string, Type<unknown, unknown>>

type EnforceOptionality<T> = RemoveQuestionMarkFromKey<Optional<T, KeysEndingInQuestionMark<T>>>

// https://github.com/Microsoft/TypeScript/issues/25760#issuecomment-705137615
type Optional<T, K extends keyof T> = Omit<T, K> & Partial<T>

type KeysEndingInQuestionMark<O extends {}> = { [K in keyof O]: K extends `${any}?` ? K : never }[keyof O]

type RemoveQuestionMarkFromKey<O extends {}> = { [K in keyof O as K extends `${infer K2}?` ? K2 : K]: O[K] }

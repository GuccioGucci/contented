import { ContentedError } from './ContentedError'
import { Coerce, coerceTo, ErrorType, ExpectedType, hasNonFatalErrors, NonFatalErrorType, Type } from './Type'
import { Expand } from './_typefunc'

export function combineIntoObject<E extends ContentedError, O extends Record<string, Type<unknown, E>>>(obj: O) {
  type CoerceObject = Coerce<ObjectOf<O>, ErrorTypeInObject<O>>
  const coerce: CoerceObject = (value: any) => {
    const out: Partial<ExpectedTypeInObject<O>> = {}
    const nonFatals = []
    let nonFatalErrors = false
    const keys = Object.keys(obj) as unknown as Array<keyof typeof obj>
    for (const key of keys) {
      const res = coerceTo(obj[key], value)
      if (res instanceof ContentedError) {
        return res as ErrorTypeInObject<O>
      } else if (hasNonFatalErrors(res)) {
        nonFatalErrors = true
        out[key] = res[0] as ExpectedTypeInObject<O>[keyof O]
        nonFatals.push(...res[1])
      } else {
        key
        out[key] = res as ExpectedTypeInObject<O>[keyof O]
      }
    }
    if (nonFatalErrors) {
      return [out, nonFatals] as ObjectOf<O>
    }
    return out as ObjectOf<O>
  }
  return new Type(coerce)
}

export type ObjectOf<O extends ObjectOfTypes> = IsWithoutNonFatalErrors<O> extends true
  ? Expand<EnforceOptionality<ExpectedTypeInObject<O>>>
  :
      | Expand<EnforceOptionality<ExpectedTypeInObject<O>>>
      | [Expand<EnforceOptionality<ExpectedTypeInObject<O>>>, NonFatalErrorTypeInObject<O>[]]

// `| never` is to force IntelliSense to expand the union type
export type ErrorTypeInObject<O extends ObjectOfTypes> = { [K in keyof O]: ErrorType<O[K]> }[keyof O] | never

type IsWithoutNonFatalErrors<O extends ObjectOfTypes> = NonFatalErrorTypeInObject<O> extends never ? true : false

type NonFatalErrorTypeInObject<O extends ObjectOfTypes> = { [K in keyof O]: NonFatalErrorType<O[K]> }[keyof O]

export type ExpectedTypeInObject<O extends ObjectOfTypes> = { [K in keyof O]: ExpectedType<O[K]> }

type ObjectOfTypes = Record<string, Type<unknown, unknown>>

type EnforceOptionality<T> = RemoveQuestionMarkFromKey<Optional<T, KeysEndingInQuestionMark<T>>>

// https://github.com/Microsoft/TypeScript/issues/25760#issuecomment-705137615
type Optional<T, K extends keyof T> = Omit<T, K> & Partial<T>

type KeysEndingInQuestionMark<O extends {}> = { [K in keyof O]: K extends `${any}?` ? K : never }[keyof O]

type RemoveQuestionMarkFromKey<O extends {}> = { [K in keyof O as K extends `${infer K2}?` ? K2 : K]: O[K] }

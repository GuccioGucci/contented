import { ContentedError } from './ContentedError'
import { Coerce, coerceTo, ErrorType, ExpectedType, hasNonFatalErrors, NonFatalErrorType, Type } from './Type'

export function combineIntoObject<E extends ContentedError, O extends Record<string, Type<unknown, E>>>(obj: O) {
  type CoerceObject = Coerce<CombineIntoObjectOf<O>, ErrorTypeInObject<O>>
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
      return [out, nonFatals] as CombineIntoObjectOf<O>
    }
    return out as CombineIntoObjectOf<O>
  }
  return new Type(coerce)
}

export type CombineIntoObjectOf<O extends ObjectOfTypes> = IsWithoutNonFatalErrors<O> extends true
  ? ExpandRecursively<ExpectedTypeInObject<O>>
  :
      | ExpandRecursively<ExpectedTypeInObject<O>>
      | [ExpandRecursively<ExpectedTypeInObject<O>>, NonFatalErrorTypesInObject<O>[]]

// `| never` is to force IntelliSense to expand the union type
export type ErrorTypeInObject<O extends ObjectOfTypes> = { [K in keyof O]: ErrorType<O[K]> }[keyof O] | never

type IsWithoutNonFatalErrors<O extends ObjectOfTypes> = NonFatalErrorTypesInObject<O> extends never ? true : false

type NonFatalErrorTypesInObject<O extends ObjectOfTypes> = { [K in keyof O]: NonFatalErrorType<O[K]> }[keyof O]

type ExpectedTypeInObject<O extends ObjectOfTypes> = EnforceOptionality<{ [K in keyof O]: ExpectedType<O[K]> }>

type ObjectOfTypes = Record<string, Type<unknown, unknown>>

type EnforceOptionality<T> = Optional<T, OptionalKeys<T>>

// https://github.com/Microsoft/TypeScript/issues/25760#issuecomment-705137615
type Optional<T, K extends keyof T> = Omit<T, K> & Partial<T>

type OptionalKeys<O extends {}> = {
  [K in keyof O]-?: [O[K] & undefined] extends [never] ? never : K
}[keyof O]

// https://stackoverflow.com/a/57683652
type ExpandRecursively<T> = T extends object
  ? T extends infer O
    ? { [K in keyof O]: ExpandRecursively<O[K]> }
    : never
  : T

// See also: https://stackoverflow.com/a/63990350

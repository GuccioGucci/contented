import { ContentedError } from './ContentedError'
import { Coerce, coerceTo, ErrorType, ExpectedType, hasNonFatalErrors, NonFatalErrorType, Type } from './Type'

export function combineIntoObject<E extends ContentedError, O extends Record<string, Type<unknown, E>>>(
  obj: O
): Type<ObjectOf<O>, ErrorTypeInObject<O>> {
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

type ObjectOf<O extends ObjectOfTypes> = IsWithoutNonFatalErrors<O> extends true
  ? ExpectedTypeInObject<O>
  : ExpectedTypeInObject<O> | [ExpectedTypeInObject<O>, NonFatalErrorTypesInObject<O>[]]

type IsWithoutNonFatalErrors<O extends ObjectOfTypes> = NonFatalErrorTypesInObject<O> extends never ? true : false

type NonFatalErrorTypesInObject<O extends ObjectOfTypes> = { [K in keyof O]: NonFatalErrorType<O[K]> }[keyof O]

type ExpectedTypeInObject<O extends ObjectOfTypes> = { [K in keyof O]: ExpectedType<O[K]> }

type ErrorTypeInObject<O extends ObjectOfTypes> = { [K in keyof O]: ErrorType<O[K]> }[keyof O]

type ObjectOfTypes = Record<string, Type<unknown, unknown>>

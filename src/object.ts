import { At, at } from './at'
import { combineIntoObject, CombineIntoObjectOf, ErrorTypeInObject } from './combineIntoObject'
import { ContentedError } from './ContentedError'
import { Type } from './Type'

export function object<E extends ContentedError, O extends Record<string, Type<unknown, E>>>(obj: O) {
  const mappedEntries = Object.entries(obj).map(([key, type]) => [key, at(key, type)])

  // Apparently, need to report the definition of Type<., .> here to have IntelliSense expand it
  return combineIntoObject(Object.fromEntries(mappedEntries)) as Type<
    CombineIntoObjectOf<ApplyAt<O>>,
    ErrorTypeInObject<ApplyAt<O>>
  >
}

type ApplyAt<O extends ObjectOfTypes> = { [K in keyof O]: At<O[K]> }

type ObjectOfTypes = Record<string, Type<unknown, unknown>>

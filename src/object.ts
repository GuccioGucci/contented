import { ErrorType, ExpectedType, NonFatalErrorType, Type } from './Type'

declare function object<T extends Record<string, Type<unknown, unknown>>>(
  obj: T
): Type<ObjectOf<T>, ErrorTypeInObject<T>>

type ObjectOf<O extends ObjectOfTypes> = IsWithoutNonFatalErrors<O> extends true
  ? ExpectedTypeInObject<O>
  : ExpectedTypeInObject<O> | [ExpectedTypeInObject<O>, NonFatalErrorTypesInObject<O>[]]

type IsWithoutNonFatalErrors<O extends ObjectOfTypes> = NonFatalErrorTypesInObject<O> extends never ? true : false

type NonFatalErrorTypesInObject<O extends ObjectOfTypes> = { [K in keyof O]: NonFatalErrorType<O[K]> }[keyof O]

type ExpectedTypeInObject<O extends ObjectOfTypes> = { [K in keyof O]: ExpectedType<O[K]> }

type ErrorTypeInObject<O extends ObjectOfTypes> = { [K in keyof O]: ErrorType<O[K]> }[keyof O]

type ObjectOfTypes = Record<string, Type<unknown, unknown>>

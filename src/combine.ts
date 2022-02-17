import { ContentedError } from './error/ContentedError'
import { Coerce, coerceTo, ExpectedType, NonFatalErrorType, Type } from './Type'
import { hasNonFatalErrors } from './error/NonFatalErrorType'

export function combine<E extends ContentedError, Ts extends Type<unknown, E>[], O>(
  fn: (...args: [...ExpectedTypes<Ts>]) => O,
  ...types: [...Ts]
) {
  type CoerceCombine = Coerce<CombinationOf<Ts, O>, UnionOfErrorTypes<Ts>>

  const coerce: CoerceCombine = (value: any) => {
    const args = []
    const nonFatals = []
    let nonFatalErrors = false
    for (const type of types) {
      const res = coerceTo(type, value)
      if (res instanceof ContentedError) {
        return res as UnionOfErrorTypes<Ts>
      } else if (hasNonFatalErrors(res)) {
        nonFatalErrors = true
        args.push(res[0])
        nonFatals.push(...res[1])
      } else {
        args.push(res)
      }
    }
    const out = fn(...(args as ExpectedTypes<Ts>))
    if (nonFatalErrors) {
      return [out, nonFatals] as CombinationOf<Ts, O>
    }
    return out as CombinationOf<Ts, O>
  }

  return new Type(coerce)
}

type CombinationOf<Ts, O> = UnionOfNonFatalErrorTypes<Ts> extends never ? O : O | [O, UnionOfNonFatalErrorTypes<Ts>[]]

type UnionOfNonFatalErrorTypes<Ts> = NonFatalErrorTypes<Ts>[number]

type ErrorType<T> = T extends Type<any, infer E> ? E : never

type ExpectedTypes<Ts> = Ts extends [infer Head, ...infer Tail] ? [ExpectedType<Head>, ...ExpectedTypes<Tail>] : []

type UnionOfErrorTypes<Ts> = ErrorTypes<Ts>[number]

type ErrorTypes<Ts> = Ts extends [infer Head, ...infer Tail] ? [ErrorType<Head>, ...ErrorTypes<Tail>] : []

type NonFatalErrorTypes<Ts> = Ts extends [infer Head, ...infer Tail]
  ? [NonFatalErrorType<Head>, ...NonFatalErrorTypes<Tail>]
  : []

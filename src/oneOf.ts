import { ContentedError } from './ContentedError'
import { ErrorType, OrErrors, Type } from './Type'

export function oneOf<
  E extends ContentedError,
  Fst extends Type<unknown, E>,
  Snd extends Type<unknown, E>,
  Ts extends Type<unknown, E>[]
>(fst: Fst, snd: Snd, ...rest: [...Ts]): Type<OneOfExpectedTypes<[Fst, Snd, ...Ts]>, OneOfErrors<[Fst, Snd, ...Ts]>> {
  type OneOf = Type<OneOfExpectedTypes<[Fst, Snd, ...Ts]>, OneOfErrors<[Fst, Snd, ...Ts]>>
  return rest.reduce(
    (accu, el) => accu.or(el) as unknown as Ts[number],
    fst.or(snd) as unknown as Ts[number]
  ) as unknown as OneOf
}

type OneOfExpectedTypes<Ts, A = never> = Ts extends [infer Head, ...infer Tail]
  ? OneOfExpectedTypes<Tail, A | OrExpectedType<Head>>
  : A

type OneOfErrors<Ts, A = 'unset'> = Ts extends [infer Head, ...infer Tail]
  ? OneOfErrors<Tail, A extends 'unset' ? ErrorType<Head> : OrErrors<A, ErrorType<Head>>>
  : A

type OrExpectedType<T> = [T] extends [Type<infer A, any>] ? A : never

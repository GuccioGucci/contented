import { ContentedError } from './ContentedError'
import { enumerate } from './enumerate'
import { InvalidCoercion } from './InvalidCoercion'
import { Type, coerceTo } from './Type'

export function at<T, E extends ContentedError>(
  path: Path,
  type: Type<T, E>
): Type<
  PropagateNonFatalError<[Type<T, E>], Get1stTupleOrElse<T>>,
  MissingKey | AtKey<InnerMostError<E>> | InvalidCoercion
> {
  return new (class extends Type<
    PropagateNonFatalError<[Type<T, E>], Get1stTupleOrElse<T>>,
    MissingKey | AtKey<InnerMostError<E>> | InvalidCoercion
  > {
    protected coerce(value: any) {
      type Coerce =
        | PropagateNonFatalError<[Type<T, E>], Get1stTupleOrElse<T>>
        | MissingKey
        | AtKey<InnerMostError<E>>
        | InvalidCoercion
      if (typeof value !== 'object') {
        return new InvalidCoercion('object', value) as Coerce
      }

      for (const [key, pos] of enumerate(path)) {
        if (value[key] === undefined) {
          const missingKey = path.slice(0, pos + 1)
          return new MissingKey(missingKey) as Coerce
        }
        value = value[key]
      }

      const res = scope<T, E>(path, coerceTo(type, value))
      if (res instanceof ContentedError) {
        return res as Coerce
      } else if (Array.isArray(res)) {
        return [
          res[0],
          res[1].map((err: ContentedError) => scope(path, err)),
        ] as Coerce
      } else {
        return res as Coerce
      }
    }
  })()
}

export function fallback<T, E extends ContentedError>(
  type: Type<T, Has<E, MissingKey, 'Must include MissingKey'>>,
  fallback: T
): Type<T, Exclude<E, MissingKey>> {
  return new (class extends Type<T, Exclude<E, MissingKey>> {
    protected coerce(value: any): T | Exclude<E, MissingKey> {
      const res = coerceTo(type, value)
      if (res instanceof MissingKey) {
        return fallback
      }
      return res as T | Exclude<E, MissingKey>
    }
  })()
}

export function arrayOf<T, E extends ContentedError>(
  type: Type<T, E>
): Type<
  PropagateNonFatalError<[Type<T, E>], Get1stTupleOrElse<T>[]>,
  AtKey<InnerMostError<E>> | HasMissingKey<E> | InvalidCoercion
> {
  return new (class extends Type<
    PropagateNonFatalError<[Type<T, E>], Get1stTupleOrElse<T>[]>,
    AtKey<InnerMostError<E>> | HasMissingKey<E> | InvalidCoercion
  > {
    protected coerce(value: any) {
      type Coerce =
        | PropagateNonFatalError<[Type<T, E>], Get1stTupleOrElse<T>[]>
        | AtKey<InnerMostError<E>>
        | HasMissingKey<E>
        | InvalidCoercion

      if (!Array.isArray(value)) {
        return new InvalidCoercion('array', value) as Coerce
      }
      const res = []
      const nonFatal = []
      let partial = false
      for (const [el, pos] of enumerate(value)) {
        const c = scope<T, E>([pos], coerceTo(type, el))
        if (c instanceof ContentedError) {
          return c as Coerce
        } else if (Array.isArray(c)) {
          partial = true
          res.push(c[0])
          nonFatal.push(...c[1].map((err: ContentedError) => scope([pos], err)))
        } else {
          res.push(c)
        }
      }
      if (partial) {
        return [res, nonFatal] as Coerce
      }
      return res as Coerce
    }
  })()
}

export function permissiveArrayOf<T, E extends ContentedError>(
  type: Type<T, E>
): Type<
  [
    T[],
    (AtKey<InnerMostError<E>> | HasMissingKey<E> | HasInvalidCoercion<E>)[]
  ],
  InvalidCoercion
> {
  return new (class extends Type<
    [
      T[],
      (AtKey<InnerMostError<E>> | HasMissingKey<E> | HasInvalidCoercion<E>)[]
    ],
    InvalidCoercion
  > {
    protected coerce(value: any) {
      type Return = [T[], (AtKey<InnerMostError<E>> | HasMissingKey<E>)[]]

      if (!Array.isArray(value)) {
        return new InvalidCoercion('array', value)
      }
      const res: T[] = []
      const errs: (
        | AtKey<InnerMostError<E>>
        | HasMissingKey<E>
        | InvalidCoercion
      )[] = []
      for (const [el, pos] of enumerate(value)) {
        const c = scope<T, E>([pos], coerceTo(type, el))
        if (c instanceof ContentedError) {
          errs.push(c)
          continue
        }
        res.push(c as T)
      }
      const tmp = [res, errs] as Return
      return tmp
    }
  })()
}

export function combine<
  E extends ContentedError,
  Ts extends Type<unknown, E>[],
  O
>(
  fn: (...args: [...ExpectedTypes<Ts>]) => O,
  ...types: [...Ts]
): Type<PropagateNonFatalError<Ts, O>, ErrorTypes<Ts>[number]> {
  type Coerce = PropagateNonFatalError<Ts, O> | ErrorTypes<Ts>[number]
  return new (class extends Type<
    PropagateNonFatalError<Ts, O>,
    ErrorTypes<Ts>[number]
  > {
    protected coerce(value: any) {
      const args = []
      const nonFatals = []
      let partial = false
      for (const type of types) {
        const res = coerceTo(type, value)
        if (res instanceof ContentedError) {
          return res as ErrorTypes<Ts>[number]
        } else if (Array.isArray(res)) {
          partial = true
          args.push(res[0])
          nonFatals.push(...res[1])
        } else {
          args.push(res)
        }
      }
      const out = fn(...(args as ExpectedTypes<Ts>))
      if (partial) {
        return [out, nonFatals] as Coerce
      }
      return out as Coerce
    }
  })()
}

function scope<T, E extends ContentedError>(
  path: Path,
  value: T | E
): T | AtKey<InnerMostError<E>> | HasMissingKey<E> {
  if (value instanceof ContentedError) {
    if (value instanceof AtKey) {
      return new AtKey(path.concat(value.at), value.error)
    }
    if (value instanceof MissingKey) {
      return new MissingKey(path.concat(value.at)) as HasMissingKey<E>
    }
    return new AtKey(path, value) as AtKey<InnerMostError<E>>
  }
  return value
}

type Has<U extends any, U1 extends any, Msg extends string> = [U1] extends [U]
  ? U
  : Msg

const AT_KEY = Symbol()
const MISSING_KEY = Symbol()

export class MissingKey extends ContentedError {
  // @ts-ignore
  private readonly missingKey: symbol

  constructor(public readonly at: Path) {
    super()
    this.missingKey = MISSING_KEY
  }
}

export class AtKey<E extends ContentedError> extends ContentedError {
  // @ts-ignore
  private readonly atKey: symbol

  constructor(public readonly at: Path, public readonly error: E) {
    super()
    this.atKey = AT_KEY
  }
}

type Key = string | symbol | number
type Path = Key[]

type InnerMostError<E extends ContentedError> = E extends AtKey<infer U>
  ? InnerMostError<U>
  : Exclude<E, MissingKey>

type HasMissingKey<E> = [MissingKey] extends [E] ? MissingKey : never
type HasInvalidCoercion<E> = E extends AtKey<any> ? InvalidCoercion : never

type ExpectedType<T> = T extends Type<infer A, any>
  ? Get1stTupleOrElse<A>
  : never
type ExpectedTypes<Ts> = Ts extends [infer Head, ...infer Tail]
  ? [ExpectedType<Head>, ...ExpectedTypes<Tail>]
  : []

type ErrorType<T> = T extends Type<any, infer E> ? E : never
type ErrorTypes<Ts> = Ts extends [infer Head, ...infer Tail]
  ? [ErrorType<Head>, ...ErrorTypes<Tail>]
  : []

type ExtractNonFatalErrors<T> = T extends Type<infer A, any>
  ? Get2ndTuple<A>
  : never

type Get1stTupleOrElse<T> = T extends [infer U, any] ? U : T

type Get2ndTuple<T> = T extends [any, infer E] ? E : never

type ExtractAllFatalErrors<Ts> = Ts extends [infer Head, ...infer Tail]
  ? [ExtractNonFatalErrors<Head>[number], ...ExtractAllFatalErrors<Tail>]
  : []

type PropagateNonFatalError<Ts, O> = TupleIfNotNever<
  [O, ExtractAllFatalErrors<Ts>[number][]]
>

type TupleIfNotNever<T> = T extends [infer O, infer E]
  ? IsNeverType<ElementType<E>> extends true
    ? O
    : T
  : never

type IsNeverType<T> = [T] extends [never] ? true : false

type ElementType<Ts> = Ts extends (infer U)[] ? U : never

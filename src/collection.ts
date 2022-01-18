import { ContentedError } from './ContentedError'
import { enumerate } from './enumerate'
import { InvalidCoercion } from './InvalidCoercion'
import { Type, coerceTo } from './Type'

export function at<T, E extends ContentedError>(
  path: Path,
  type: Type<T, E>
): Type<T, MissingKey | AtKey<InnerMostError<E>> | InvalidCoercion> {
  return new (class extends Type<
    T,
    MissingKey | AtKey<InnerMostError<E>> | InvalidCoercion
  > {
    protected coerce(value: any) {
      if (typeof value !== 'object') {
        return new InvalidCoercion('object', value)
      }

      for (const [key, pos] of enumerate(path)) {
        if (value[key] === undefined) {
          const missingKey = path.slice(0, pos + 1)
          return new MissingKey(missingKey)
        }
        value = value[key]
      }

      return scope<T, E>(path, coerceTo(type, value))
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
): Type<T[], AtKey<InnerMostError<E>> | HasMissingKey<E> | InvalidCoercion> {
  return new (class extends Type<
    T[],
    AtKey<InnerMostError<E>> | HasMissingKey<E> | InvalidCoercion
  > {
    protected coerce(value: any) {
      if (!Array.isArray(value)) {
        return new InvalidCoercion('array', value)
      }
      const res = []
      for (const [el, pos] of enumerate(value)) {
        const c = scope<T, E>([pos], coerceTo(type, el))
        if (c instanceof ContentedError) {
          return c
        }
        res.push(c)
      }
      return res
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
): Type<O, ErrorTypes<Ts>[number]> {
  return new (class extends Type<O, ErrorTypes<Ts>[number]> {
    protected coerce(value: any) {
      const args = []
      for (const type of types) {
        const res = coerceTo(type, value)
        if (res instanceof ContentedError) {
          return res as ErrorTypes<Ts>[number]
        }
        args.push(res)
      }
      return fn(...(args as ExpectedTypes<Ts>))
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

type ExpectedType<T> = T extends Type<infer A, any> ? A : never
type ExpectedTypes<Ts> = Ts extends [infer Head, ...infer Tail]
  ? [ExpectedType<Head>, ...ExpectedTypes<Tail>]
  : []

type ErrorType<T> = T extends Type<any, infer E> ? E : never
type ErrorTypes<Ts> = Ts extends [infer Head, ...infer Tail]
  ? [ErrorType<Head>, ...ErrorTypes<Tail>]
  : []

import { ContentedError } from './ContentedError'
import { enumerate } from './enumerate'
import { InvalidCoercion } from './InvalidCoercion'
import { Type, coerceTo, Coerce } from './Type'

export function at<T, E extends ContentedError>(
  path: Path,
  type: Type<T, E>
): Type<T, MissingKey | HasAtKeyInvalidCoercion<E> | InvalidCoercion> {
  type AtError = MissingKey | HasAtKeyInvalidCoercion<E> | InvalidCoercion

  const coerce: Coerce<T, AtError> = (value: any) => {
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

    const res = coerceTo(type, value)
    if (res instanceof ContentedError) {
      return scope(path, res)
    }
    if (Array.isArray(res)) {
      const [value, errors] = res
      return [
        value,
        errors.map((err: ContentedError) => scope(path, err)),
      ] as unknown as T
    }
    return res
  }

  return new Type(coerce)
}

export function fallback<T, E extends ContentedError>(
  type: Type<T, Has<E, MissingKey, 'Must include MissingKey'>>,
  fallback: T
): Type<T, Exclude<E, MissingKey>> {
  type FallbackError = Exclude<E, MissingKey>

  const coerce: Coerce<T, FallbackError> = (value: any) => {
    const res = coerceTo(type as Type<T, E>, value)
    if (res instanceof MissingKey) {
      return fallback
    }
    return res as T | Exclude<E, MissingKey>
  }

  return new Type(coerce)
}

export function arrayOf<T, E extends ContentedError>(
  type: Type<T, E>
): Type<
  ArrayOf<T>,
  HasAtKeyInvalidCoercion<E> | HasMissingKey<E> | InvalidCoercion
> {
  type ArrayOfError =
    | HasAtKeyInvalidCoercion<E>
    | HasMissingKey<E>
    | InvalidCoercion

  const coerce: Coerce<ArrayOf<T>, ArrayOfError> = (value: any) => {
    if (!Array.isArray(value)) {
      return new InvalidCoercion('array', value)
    }

    const res = []
    const nonFatal = []
    let hasNonFatalErrors = false
    for (const [el, pos] of enumerate(value)) {
      const c = coerceTo(type, el)
      if (c instanceof ContentedError) {
        return scope([pos], c)
      } else if (Array.isArray(c)) {
        hasNonFatalErrors = true
        res.push(c[0])
        nonFatal.push(...c[1].map((err: ContentedError) => scope([pos], err)))
      } else {
        res.push(c)
      }
    }
    if (hasNonFatalErrors) {
      return [res, nonFatal] as ArrayOf<T>
    }
    return res as ArrayOf<T>
  }

  return new Type(coerce)
}

export function permissiveArrayOf<T, E extends ContentedError>(
  type: Type<T, E>
): Type<PermissiveArrayOf<T, E>, InvalidCoercion> {
  const coerce: Coerce<PermissiveArrayOf<T, E>, InvalidCoercion> = (
    value: any
  ) => {
    if (!Array.isArray(value)) {
      return new InvalidCoercion('array', value)
    }
    const res = []
    const errs = []
    for (const [el, pos] of enumerate(value)) {
      const c = coerceTo(type, el)
      if (c instanceof ContentedError) {
        errs.push(scope([pos], c))
        continue
      } else if (Array.isArray(c)) {
        res.push(c[0])
        errs.push(...c[1].map((err: ContentedError) => scope([pos], err)))
      } else {
        res.push(c)
      }
    }
    return [res, errs] as PermissiveArrayOf<T, E>
  }

  return new Type(coerce)
}

export function combine<
  E extends ContentedError,
  Ts extends Type<unknown, E>[],
  O
>(
  fn: (...args: [...ExpectedTypes<Ts>]) => O,
  ...types: [...Ts]
): Type<CombinationOf<Ts, O>, UnionOfErrorTypes<Ts>> {
  const coerce: Coerce<CombinationOf<Ts, O>, UnionOfErrorTypes<Ts>> = (
    value: any
  ) => {
    const args = []
    const nonFatals = []
    let hasNonFatalErrors = false
    for (const type of types) {
      const res = coerceTo(type, value)
      if (res instanceof ContentedError) {
        return res as UnionOfErrorTypes<Ts>
      } else if (Array.isArray(res)) {
        hasNonFatalErrors = true
        args.push(res[0])
        nonFatals.push(...res[1])
      } else {
        args.push(res)
      }
    }
    const out = fn(...(args as ExpectedTypes<Ts>))
    if (hasNonFatalErrors) {
      return [out, nonFatals] as CombinationOf<Ts, O>
    }
    return out as CombinationOf<Ts, O>
  }

  return new Type(coerce)
}

function scope<E extends ContentedError>(
  path: Path,
  err: E
): HasMissingKey<E> | HasAtKeyInvalidCoercion<E> {
  if (err instanceof AtKeyInvalidCoercion) {
    return new AtKeyInvalidCoercion(
      path.concat(err.at),
      err.error
    ) as HasAtKeyInvalidCoercion<E>
  }
  if (err instanceof MissingKey) {
    return new MissingKey(path.concat(err.at)) as HasMissingKey<E>
  }
  if (err instanceof InvalidCoercion) {
    return new AtKeyInvalidCoercion(path, err) as HasAtKeyInvalidCoercion<E>
  }
  throw new Error(`Unknown error type: ${err}`)
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

// ==============================================
// Errors
// ==============================================
export class AtKeyInvalidCoercion extends ContentedError {
  // @ts-ignore
  private readonly atKey: symbol

  constructor(
    public readonly at: Path,
    public readonly error: InvalidCoercion
  ) {
    super()
    this.atKey = AT_KEY
  }
}

type Key = string | symbol | number
type Path = Key[]

type HasMissingKey<E> = [MissingKey] extends [E] ? MissingKey : never

type HasAtKeyInvalidCoercion<E> = [InvalidCoercion] extends [E]
  ? AtKeyInvalidCoercion
  : never

// ==============================================
// Type-level functions for `Type<A, B>`
// ==============================================
type ExpectedType<T> = T extends Type<infer A, any>
  ? A extends [infer U, any]
    ? U
    : A
  : never

type ErrorType<T> = T extends Type<any, infer E> ? E : never

type NonFatalErrorType<T> = T extends Type<[any, (infer NF)[]], any>
  ? NF
  : never

// ==============================================
// Type-level functions for combine()
// ==============================================
type CombinationOf<Ts, O> = UnionOfNonFatalErrorTypes<Ts> extends never
  ? O
  : [O, UnionOfNonFatalErrorTypes<Ts>[]]

type UnionOfNonFatalErrorTypes<Ts> = NonFatalErrorTypes<Ts>[number]

type NonFatalErrorTypes<Ts> = Ts extends [infer Head, ...infer Tail]
  ? [NonFatalErrorType<Head>, ...NonFatalErrorTypes<Tail>]
  : []

type ExpectedTypes<Ts> = Ts extends [infer Head, ...infer Tail]
  ? [ExpectedType<Head>, ...ExpectedTypes<Tail>]
  : []

type UnionOfErrorTypes<Ts> = ErrorTypes<Ts>[number]

type ErrorTypes<Ts> = Ts extends [infer Head, ...infer Tail]
  ? [ErrorType<Head>, ...ErrorTypes<Tail>]
  : []

// ==============================================
// Type-level functions for arrayOf()
// ==============================================
type ArrayOf<T> = T extends [infer O, infer NFs] ? [O[], NFs] : T[]

// ==============================================
// Type-level functions for permissiveArrayOf()
// ==============================================
type PermissiveArrayOf<T, E> = T extends [infer O, (infer NF)[]]
  ? [O[], (HasAtKeyInvalidCoercion<E> | HasMissingKey<E> | NF)[]]
  : [T[], (HasAtKeyInvalidCoercion<E> | HasMissingKey<E>)[]]

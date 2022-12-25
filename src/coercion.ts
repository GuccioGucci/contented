import type { Any, Every, HasRequiredKeys, IsTypeOf, IsUnion, Not, UnionToTuple } from './_typefunc'
import {
  Type,
  PrimitiveSchema,
  isPrimitiveSchema,
  Schema,
  isLiteralSchema,
  LiteralSchema,
  ObjectSchema,
  isObjectSchema,
  isOneOfSchema,
  OneOfSchema,
  isArrayOfSchema,
  ArrayOfSchema,
} from './Type'

export function coerceTo<R>(type: Type<R>, value: any): R | Expand<WhyValueIsNot<R>> {
  const { schema } = type
  return coerce(schema, value)
}

function coerce(schema: Schema, value: any): any {
  if (isPrimitiveSchema(schema)) {
    return coercePrimitive(schema, value)
  }
  if (isLiteralSchema(schema)) {
    return coerceLiteral(schema, value)
  }
  if (isObjectSchema(schema)) {
    return coerceObject(schema, value)
  }
  if (isOneOfSchema(schema)) {
    return coerceOneOf(schema, value)
  }
  if (isArrayOfSchema(schema)) {
    return coerceArrayOf(schema, value)
  }
}

function coercePrimitive(schema: PrimitiveSchema, value: any): any {
  return typeof value === schema ? value : new InvalidType(schema, value)
}

function coerceLiteral(schema: LiteralSchema, value: any): any {
  return schema.literal === value ? value : new InvalidType(`${schema.literal}`, value)
}

function coerceObject(schema: ObjectSchema, value: any): any {
  if (typeof value !== 'object') {
    return new InvalidType('object', value)
  }

  const objectSchema = schema.object
  for (let [key, schemaAtKey] of Object.entries(objectSchema)) {
    const optional = key.endsWith('?')
    key = optional ? key.slice(0, -1) : key

    if (optional && !value.hasOwnProperty(key)) continue
    if (optional && value[key] === undefined) continue
    if (!optional && value[key] === undefined) return new MissingKey([key])

    const res = coerce(schemaAtKey, value[key])
    if (res instanceof CoercionError) {
      return scope([key], res)
    }
  }

  return value
}

function coerceArrayOf(schema: ArrayOfSchema, value: any): any {
  if (!Array.isArray(value)) {
    return new InvalidType('array', value)
  }

  let pos = 0
  for (const el of value) {
    const res = coerce(schema.arrayOf, el)
    if (res instanceof CoercionError) {
      return scope([pos], res)
    }
    pos += 1
  }
  return value
}

function coerceOneOf(schema: OneOfSchema, value: any): any {
  const schemas = schema.oneOf
  const errors: any[] = []
  for (let schema of schemas) {
    const res = coerce(schema, value)
    if (!(res instanceof CoercionError)) {
      return res
    }
    errors.push(res)
  }
  return new Joint(errors)
}

export function scope(path: Path, error: CoercionError): CoercionError {
  if (error instanceof AtKey) {
    return new AtKey(path.concat(error.atKey), error.error)
  }
  if (error instanceof MissingKey) {
    return new MissingKey(path.concat(error.missingKey))
  }
  if (error instanceof InvalidType) {
    return new AtKey(path, error)
  }
  if (error instanceof Joint) {
    return new Joint(error.errors.map((inner: CoercionError) => scope(path, inner)))
  }
  /* c8 ignore next */
  throw new Error(`Unknown error type: ${error}`)
}

// ======================================================================
// Coercion Error
// ======================================================================
const COERCION_ERROR = Symbol()

export abstract class CoercionError {
  //@ts-ignore
  private readonly [COERCION_ERROR]: true
}

// ----------------------------------------------------------------------
// InvalidType
// ----------------------------------------------------------------------
const INVALID_TYPE = Symbol()

export class InvalidType extends CoercionError {
  // @ts-ignore
  private readonly [INVALID_TYPE]: true

  constructor(public readonly expected: string, public readonly got: any) {
    super()
  }
}

// ----------------------------------------------------------------------
// AtKey
// ----------------------------------------------------------------------
const AT_KEY = Symbol()

export class AtKey<E> extends CoercionError {
  // @ts-ignore
  private readonly [AT_KEY]: true

  constructor(public readonly atKey: Path, public readonly error: E) {
    super()
  }
}

// ----------------------------------------------------------------------
// MissingKey
// ----------------------------------------------------------------------
const MISSING_KEY = Symbol()

export class MissingKey extends CoercionError {
  // @ts-ignore
  private readonly [MISSING_KEY]: true

  constructor(public readonly missingKey: Path) {
    super()
  }
}

// ----------------------------------------------------------------------
// Joint
// ----------------------------------------------------------------------
const JOINT = Symbol()

export class Joint<E extends unknown[]> extends CoercionError {
  // @ts-ignore
  private readonly [JOINT]: true

  constructor(public readonly errors: E) {
    super()
  }
}

// ----------------------------------------------------------------------
// Path
// ----------------------------------------------------------------------
type Path = Key[]

type Key = string | symbol | number

// ======================================================================
// Why value is not...
// ======================================================================
type WhyValueIsNot<R, Cont = DoneCont> = IsPrimitive<R> extends true
  ? Resume<Cont, InvalidType>
  : IsMatch<R> extends true
  ? Resume<Cont, InvalidType>
  : IsOneOf<R> extends true
  ? WhyValueIsNotOneOf<R, Cont>
  : IsArray<R> extends true
  ? WhyValueIsNotArray<R, Cont>
  : IsObject<R> extends true
  ? WhyValueIsNotObject<R, Cont>
  : 'UKNOWN SCHEMA'

// TODO: move isMatch as implicit else case

// ----------------------------------------------------------------------
// ...a oneOf
// ----------------------------------------------------------------------
type WhyValueIsNotOneOf<R, Cont> = Map_WhyWalueIsNotOneOf<UnionToTuple<R>, JointCont<Cont>>

type Map_WhyWalueIsNotOneOf<Rs, Cont> = Rs extends [infer Head, ...infer Tail]
  ? WhyValueIsNot<Head, OneOfTailCont<Tail, Cont>>
  : Resume<Cont, []>

// ----------------------------------------------------------------------
// ...an array
// ----------------------------------------------------------------------
type WhyValueIsNotArray<R, Cont> = R extends (infer E)[]
  ? WhyValueIsNot<E, ScopeCont<InvalidTypeCont<Cont>>>
  : Resume<Cont, 'EXPECTED AN ARRAY'>

// ----------------------------------------------------------------------
// ...an object
// ----------------------------------------------------------------------
type WhyValueIsNotObject<R, Cont> = Map_WhyValueIsNotObject<ToObjectValues<Required<R>>, MissingKeyCont<R, Cont>>

type Map_WhyValueIsNotObject<Entries, Cont> = Entries extends [[infer Head], ...infer Tail]
  ? WhyValueIsNot<Head, ScopeCont<ObjectTailCont<Tail, Cont>>>
  : Resume<Cont, InvalidType> // the base error case of object is that the input is not an object

type ToObjectValues<O> = UnionToTuple<{ [K in keyof O]: [O[K]] }[keyof O]> // We wrap it in a tuple so that we preserve union types

// ======================================================================
// Scope
// ======================================================================
// As a error associated with an object property, Joint<> never appears as part
// of a union type
type Scope<Why, C> = [Why] extends [Joint<infer Ws>] ? Map_Scope<Ws, JointCont<C>> : Resume<C, ScopeOverUnion<Why>>

type ScopeOverUnion<Why> = Why extends any ? (Why extends InvalidType ? AtKey<InvalidType> : Why) : never

type Map_Scope<Ws, Cont> = Ws extends [infer Head, ...infer Tail]
  ? Scope<Head, ScopeTailCont<Tail, Cont>>
  : Resume<Cont, []>

// ======================================================================
// Continuations
// ======================================================================
type Resume<C, Arg> =
  | (Is_DoneCont<C> extends true ? Resume_DoneCont<C, Arg> : never)
  | (Is_JointCont<C> extends true ? Resume_JointCont<C, Arg> : never)
  | (Is_OneOfTailCont<C> extends true ? Resume_OneOfTailCont<C, Arg> : never)
  | (Is_AppendWhyCont<C> extends true ? Resume_AppendWhyCont<C, Arg> : never)
  | (Is_MissingKeyCont<C> extends true ? Resume_MissingKeyCont<C, Arg> : never)
  | (Is_InvalidTypeCont<C> extends true ? Resume_InvalidTypeCont<C, Arg> : never)
  | (Is_ScopeCont<C> extends true ? Resume_ScopeCont<C, Arg> : never)
  | (Is_ScopeTailCont<C> extends true ? Resume_ScopeTailCont<C, Arg> : never)
  | (Is_ObjectTailCont<C> extends true ? Resume_ObjectTailCont<C, Arg> : never)
  | (Is_DisjoinWhyCont<C> extends true ? Resume_DisjoinWhyCont<C, Arg> : never)
  | never

type Resume_DoneCont<_C, Arg> = Arg

type Resume_JointCont<C, Arg> = Arg extends unknown[] ? Resume<JointCont_Cont<C>, Joint<Arg>> : never

type Resume_OneOfTailCont<C, Arg> = Map_WhyWalueIsNotOneOf<
  OneOfTailCont_Tail<C>,
  AppendWhyCont<Arg, OneOfTailCont_Cont<C>>
>

type Resume_AppendWhyCont<C, Arg> = Arg extends unknown[]
  ? Resume<AppendWhyCont_Cont<C>, [AppendWhyCont_Why<C>, ...Arg]>
  : never

type Resume_MissingKeyCont<C, Arg> = HasRequiredKeys<MissingKeyCont_Obj<C>> extends true
  ? Resume<MissingKeyCont_Cont<C>, MissingKey | Arg>
  : Resume<MissingKeyCont_Cont<C>, Arg>

type Resume_InvalidTypeCont<C, Arg> = Resume<InvalidTypeCont_Cont<C>, Arg | InvalidType>

type Resume_ScopeCont<C, Arg> = Scope<Arg, ScopeCont_Cont<C>>

type Resume_ScopeTailCont<C, Arg> = Map_Scope<ScopeTailCont_Tail<C>, AppendWhyCont<Arg, ScopeTailCont_Cont<C>>>

type Resume_ObjectTailCont<C, Arg> = Map_WhyValueIsNotObject<
  ObjectTailCont_Tail<C>,
  DisjoinWhyCont<Arg, ObjectTailCont_Cont<C>>
>

type Resume_DisjoinWhyCont<C, Arg> = Resume<DisjoinWhyCont_Cont<C>, Arg | DisjoinWhyCont_Why<C>>

// ----------------------------------------------------------------------
// DontCont
// ----------------------------------------------------------------------
type DoneCont = 'done-cont'

type Is_DoneCont<C> = C extends 'done-cont' ? true : false

// ----------------------------------------------------------------------
// JointCont
// ----------------------------------------------------------------------
type JointCont<Cont> = ['joint-cont', Cont]

type JointCont_Cont<C> = C extends ['joint-cont', infer NextCont] ? NextCont : never

type Is_JointCont<C> = C extends ['joint-cont', any] ? true : false

// ----------------------------------------------------------------------
// OneOfTailCont
// ----------------------------------------------------------------------
type OneOfTailCont<Tail, Cont> = ['one-of-tail-cont', Tail, Cont]

type Is_OneOfTailCont<C> = C extends ['one-of-tail-cont', any, any] ? true : false

type OneOfTailCont_Cont<C> = C extends ['one-of-tail-cont', any, infer NextCont] ? NextCont : never

type OneOfTailCont_Tail<C> = C extends ['one-of-tail-cont', infer Tail, any] ? Tail : never

// ----------------------------------------------------------------------
// AppendWhyCont
// ----------------------------------------------------------------------
type AppendWhyCont<Why, Cont> = ['append-why-cont', Why, Cont]

type Is_AppendWhyCont<C> = C extends ['append-why-cont', any, any] ? true : false

type AppendWhyCont_Why<C> = C extends ['append-why-cont', infer Why, any] ? Why : never

type AppendWhyCont_Cont<C> = C extends ['append-why-cont', any, infer NextCont] ? NextCont : never

// ----------------------------------------------------------------------
// MissingKeyCont
// ----------------------------------------------------------------------
type MissingKeyCont<O, Cont> = ['missing-key-cont', O, Cont]

type Is_MissingKeyCont<C> = C extends ['missing-key-cont', any, any] ? true : false

type MissingKeyCont_Cont<C> = C extends ['missing-key-cont', any, infer NextCont] ? NextCont : never

type MissingKeyCont_Obj<C> = C extends ['missing-key-cont', infer O, any] ? O : never

// ----------------------------------------------------------------------
// InvalidTypeCont
// ----------------------------------------------------------------------
type InvalidTypeCont<Cont> = ['invalid-coercion-cont', Cont]

type Is_InvalidTypeCont<C> = C extends ['invalid-coercion-cont', any] ? true : false

type InvalidTypeCont_Cont<C> = C extends ['invalid-coercion-cont', infer NextCont] ? NextCont : never

// ----------------------------------------------------------------------
// ScopeCont
// ----------------------------------------------------------------------
type ScopeCont<Cont> = ['scope-cont', Cont]

type Is_ScopeCont<C> = C extends ['scope-cont', any] ? true : false

type ScopeCont_Cont<C> = C extends ['scope-cont', infer NextCont] ? NextCont : never

// ----------------------------------------------------------------------
// ScopeTailCont
// ----------------------------------------------------------------------
type ScopeTailCont<Tail, Cont> = ['scope-tail-cont', Tail, Cont]

type Is_ScopeTailCont<C> = C extends ['scope-tail-cont', any, any] ? true : false

type ScopeTailCont_Cont<C> = C extends ['scope-tail-cont', any, infer NextCont] ? NextCont : never

type ScopeTailCont_Tail<C> = C extends ['scope-tail-cont', infer Tail, any] ? Tail : never

// ----------------------------------------------------------------------
// ObjectTailCont
// ----------------------------------------------------------------------
type ObjectTailCont<Tail, Cont> = ['object-tail-cont', Tail, Cont]

type Is_ObjectTailCont<C> = C extends ['object-tail-cont', any, any] ? true : false

type ObjectTailCont_Cont<C> = C extends ['object-tail-cont', any, infer NextCont] ? NextCont : never

type ObjectTailCont_Tail<C> = C extends ['object-tail-cont', infer Tail, any] ? Tail : never

// ----------------------------------------------------------------------
// DisjoinWhyCont
// ----------------------------------------------------------------------
type DisjoinWhyCont<Why, Cont> = ['disjoin-why-cont', Why, Cont]

type Is_DisjoinWhyCont<C> = C extends ['disjoin-why-cont', any, any] ? true : false

type DisjoinWhyCont_Why<C> = C extends ['disjoin-why-cont', infer Why, any] ? Why : never

type DisjoinWhyCont_Cont<C> = C extends ['disjoin-why-cont', any, infer NextCont] ? NextCont : never

// ======================================================================
// Type-level predicates
// ======================================================================
export type IsPrimitive<R> = Any<[IsTypeOf<R, string>, IsTypeOf<R, boolean>, IsTypeOf<R, number>]>

export type IsMatch<R> = Every<
  [
    Not<IsUnion<R>>,
    Any<[R extends string ? true : false, R extends number ? true : false, R extends boolean ? true : false]>
  ]
>

export type IsOneOf<R> = IsUnion<R>

export type IsObject<R> = [R] extends [object] ? true : false

export type IsArray<R> = [R] extends [any[]] ? true : false

// ======================================================================
// Expand
// ======================================================================
type Expand<R> = InferCov<Cov<R>>

type Cov<T> = T extends any ? () => T : never

type InferCov<T> = [T] extends [() => infer I] ? I : never

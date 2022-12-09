export type Narrow<A> =
  | (A extends [] ? [] : never)
  | (A extends string | number | boolean ? A : never)
  | {
      [K in keyof A]: A[K] extends Function ? A[K] : Narrow<A[K]>
    }

export type IsUnion<T> = [T] extends [UnionToIntersection<T>] ? false : true

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never

// See: https://github.com/millsp/ts-toolbelt/blob/319e551/sources/Any/Equals.ts#L15
export type IsTypeOf<A1 extends any, A2 extends any> = (<A>() => A extends A2 ? 1 : 0) extends <A>() => A extends A1
  ? 1
  : 0
  ? true
  : false

export type Any<Ps> = Ps extends [infer H extends boolean, ...infer Ts extends boolean[]]
  ? H extends true
    ? true
    : Any<Ts>
  : false

export type Every<Ps> = Ps extends [infer H extends boolean, ...infer Ts extends boolean[]]
  ? H extends false
    ? false
    : Every<Ts>
  : true

export type Not<P extends boolean> = P extends true ? false : true

// See: https://www.hacklewayne.com/typescript-convert-union-to-tuple-array-yes-but-how
export type UnionToTuple<T> = PickOne<T> extends infer U
  ? Exclude<T, U> extends never
    ? [T]
    : [...UnionToTuple<Exclude<T, U>>, U]
  : never

type PickOne<T> = InferContra<InferContra<Contra<Contra<T>>>>

// boolean distributes over conditional types as true | false, which is not
// what we want. So we treat it separately from the general case.
type Contra<T> = T extends boolean ? Contra_<Exclude<T, boolean>> | ((arg: boolean) => void) : Contra_<T>

type Contra_<T> = T extends any ? (arg: T) => void : never

type InferContra<T> = [T] extends [(arg: infer I) => void] ? I : never

// See: https://github.com/sindresorhus/type-fest/blob/main/source/has-required-keys.d.ts
export type HasRequiredKeys<BaseType> = RequiredKeysOf<BaseType> extends never ? false : true

type RequiredKeysOf<BaseType> = Exclude<
  {
    [Key in keyof BaseType]: BaseType extends Record<Key, BaseType[Key]> ? Key : never
  }[keyof BaseType],
  undefined
>

// https://github.com/microsoft/TypeScript/issues/23182#issuecomment-379091887
export type Has<T> = [T] extends [never] ? false : true

export type Narrow<A> =
  | (A extends [] ? [] : never)
  | (A extends string | number | boolean ? A : never)
  | {
      [K in keyof A]: A[K] extends Function ? A[K] : Narrow<A[K]>
    }

export type IsUnion<T> = [T] extends [UnionToIntersection<T>] ? false : true

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never

// https://stackoverflow.com/a/57683652
export type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never

// https://github.com/millsp/ts-toolbelt/blob/319e551/sources/Any/Equals.ts#L15
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

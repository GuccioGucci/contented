// https://github.com/microsoft/TypeScript/issues/23182#issuecomment-379091887
export type Has<T> = [T] extends [never] ? false : true

export type Narrow<A> =
  | (A extends [] ? [] : never)
  | (A extends string | number | bigint | boolean ? A : never)
  | {
      [K in keyof A]: A[K] extends Function ? A[K] : Narrow<A[K]>
    }

export type IsUnion<T> = [T] extends [UnionToIntersection<T>] ? false : true

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never

// https://stackoverflow.com/a/57683652
export type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never

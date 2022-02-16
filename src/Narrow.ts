export type Narrow<A> =
  | (A extends [] ? [] : never)
  | (A extends string | number | bigint | boolean ? A : never)
  | {
      [K in keyof A]: A[K] extends Function ? A[K] : Narrow<A[K]>
    }

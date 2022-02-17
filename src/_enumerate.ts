export function* enumerate<T>(xs: T[]) {
  for (let i = 0; i < xs.length; i++) {
    yield [xs[i], i] as const
  }
}

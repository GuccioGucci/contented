export class Path {
  private readonly keys: Key[]
  private readonly opt: Options

  constructor(keys: Key[], opt: Options = {}) {
    this.keys = keys
    this.opt = opt
  }

  across(root: Record<Key, unknown> | unknown[]): unknown | MissingKey {
    let curr: any = root
    for (const [key, pos] of enumerate(this.keys)) {
      const value = curr[key]
      if (value === undefined) {
        const fallback = this.opt.fallback
        return fallback ? fallback : new MissingKey(this.keys.slice(0, pos + 1))
      }
      curr = curr[key]
    }
    return curr
  }
}

export class MissingKey {
  constructor(public readonly at: Key[]) {}
}

type Key = string | symbol | number

type Options = { fallback?: any }

function* enumerate<T>(xs: T[]) {
  for (let i = 0; i < xs.length; i++) {
    yield [xs[i], i] as const
  }
}

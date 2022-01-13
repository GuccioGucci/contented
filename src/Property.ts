import { as, As, InvalidCoercion } from './As'

export class Property<T> {
  private readonly at: At
  private readonly as: As<T>
  private readonly opt: Options<T>

  constructor(at: At, as: As<T>, opt: Options<T> = {}) {
    this.at = at
    this.as = as
    this.opt = opt
  }

  across(
    root: Record<Key, unknown> | unknown[]
  ): T | MissingKey | InvalidCoercion {
    let curr: any = root
    for (const [key, pos] of enumerate(this.at)) {
      if (curr[key] === undefined) {
        const fallback = this.opt.fallback
        return fallback ? fallback : new MissingKey(this.at.slice(0, pos + 1))
      }
      curr = curr[key]
    }
    return as(this.as, curr)
  }
}

export class MissingKey {
  constructor(public readonly at: At) {}
}

type Key = string | symbol | number
type At = Key[]

type Options<T> = { fallback?: T }

function* enumerate<T>(xs: T[]) {
  for (let i = 0; i < xs.length; i++) {
    yield [xs[i], i] as const
  }
}

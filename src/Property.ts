import { as, As, InvalidCoercion } from './As'

interface Property<T> {
  across(
    root: Record<Key, unknown> | unknown[]
  ): T | MissingKey | InvalidCoercion
  orElse(fallback: T): Property<T>
}

class MandatoryProperty<T> implements Property<T> {
  private readonly path: Path
  private readonly as: As<T>

  constructor(path: Path, as: As<T>) {
    this.path = path
    this.as = as
  }

  across(
    root: Record<Key, unknown> | unknown[]
  ): T | MissingKey | InvalidCoercion {
    let curr: any = root
    for (const [key, pos] of enumerate(this.path)) {
      if (curr[key] === undefined) {
        return new MissingKey(this.path.slice(0, pos + 1))
      }
      curr = curr[key]
    }
    return as(this.as, curr)
  }

  orElse(fallback: T): Property<T> {
    return new PropertyWithFallback(this.path, this.as, fallback)
  }
}

class PropertyWithFallback<T> extends MandatoryProperty<T> {
  private readonly fallback: T

  constructor(at: Path, as: As<T>, fallback: T) {
    super(at, as)
    this.fallback = fallback
  }

  across(root: Record<Key, unknown> | unknown[]) {
    const res = super.across(root)
    if (res instanceof MissingKey) {
      return this.fallback
    }
    return res
  }
}

export function at<T>(path: Path, as: As<T>): Property<T> {
  return new MandatoryProperty(path, as)
}

export class MissingKey {
  constructor(public readonly at: Path) {}
}

type Key = string | symbol | number
type Path = Key[]

function* enumerate<T>(xs: T[]) {
  for (let i = 0; i < xs.length; i++) {
    yield [xs[i], i] as const
  }
}

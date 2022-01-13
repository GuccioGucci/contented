import { test } from 'uvu'
import { As, as } from './As'

export function at<T, E>(path: Path, asT: As<T, E>): As<T, E | MissingKey> {
  return new (class extends As<T, E | MissingKey> {
    protected coerce(value: any): T | E | MissingKey {
      let curr: any = value
      for (const [key, pos] of enumerate(path)) {
        if (curr?.[key] === undefined) {
          return new MissingKey(path.slice(0, pos + 1))
        }
        curr = curr[key]
      }
      return as(asT, curr)
    }
  })()
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

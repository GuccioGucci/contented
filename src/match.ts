import { Type } from './Type'
import { Narrow } from './_typefunc'

export function match<R extends string | number | boolean>(match: Narrow<R>): Type<Narrow<R>> {
  return { schema: { match } }
}

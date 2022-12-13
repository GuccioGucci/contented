import { Type } from './Type'
import { Narrow } from './_typefunc'

export function literal<R extends string | number | boolean>(value: Narrow<R>): Type<Narrow<R>> {
  return { schema: { literal: value } }
}

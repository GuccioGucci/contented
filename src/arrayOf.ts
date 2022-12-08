import { Type } from './Type'

export function arrayOf<R>(type: Type<R>): Type<R[]> {
  return { schema: { arrayOf: type.schema } }
}

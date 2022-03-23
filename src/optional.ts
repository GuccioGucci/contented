import { always } from './always'
import { Type } from './Type'

export function optional<T, E>(type: Type<T, E>) {
  return type.or(always(undefined))
}

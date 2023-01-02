import { isValid } from './isValid'
import { Type } from './Type'

export function coerceTo<R>(type: Type<R>, value: any): R | undefined {
  return isValid(type, value) ? value : undefined
}

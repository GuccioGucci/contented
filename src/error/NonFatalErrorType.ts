import { ContentedError } from './ContentedError'

export function hasNonFatalErrors(res: any): res is [unknown, ContentedError[]] {
  return Array.isArray(res) && res.length == 2 && res[1].every((err: any) => err instanceof ContentedError)
}

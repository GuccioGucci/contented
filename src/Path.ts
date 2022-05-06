export type Key = string | symbol | number
export type Path = Key[]

export function access(obj: { [key: Key]: unknown }, key: Key) {
  key = removeQuestionMarkIfPresent(key)
  return obj[key]
}

export function isOptional(key: Key): key is string {
  return typeof key === 'string' && key.endsWith('?')
}

export function slicePath(path: Path, pos: number) {
  return path.slice(0, pos + 1).map(removeQuestionMarkIfPresent)
}

function removeQuestionMarkIfPresent(key: Key): Key {
  return isOptional(key) ? key.slice(0, -1) : key
}

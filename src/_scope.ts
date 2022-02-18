import { ContentedError } from './ContentedError'
import { Path } from './Path'
import { HasMissingKey, MissingKey } from './MissingKey'
import { AtKey, HasAtKeyInvalidCoercion, InvalidCoercion } from './InvalidCoercion'
import { HasJointAtKey, Joint } from './Joint'

export function _scope<E extends ContentedError>(path: Path, error: E): ScopedContentedError<E> {
  if (error instanceof AtKey) {
    return new AtKey(path.concat(error.at), error.error) as ScopedContentedError<E>
  }
  if (error instanceof MissingKey) {
    return new MissingKey(path.concat(error.missingKey)) as HasMissingKey<E>
  }
  if (error instanceof InvalidCoercion) {
    return new AtKey(path, error) as ScopedContentedError<E>
  }
  if (error instanceof Joint) {
    return new Joint(error.errors.map((inner: ContentedError) => _scope(path, inner))) as ScopedContentedError<E>
  }
  /* c8 ignore next */
  throw new Error(`Unknown error type: ${error}`)
}

type ScopedContentedError<E> = HasMissingKey<E> | HasAtKeyInvalidCoercion<E> | HasJointAtKey<E>

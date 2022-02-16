import { ContentedError } from './ContentedError'
import { Path } from '../Path'
import { HasMissingKey } from './HasMissingKey'
import { HasAtKeyInvalidCoercion } from './HasAtKeyInvalidCoercion'
import { HasJointAtKey } from './HasJointAtKey'
import { AtKey } from './AtKey'
import { MissingKey } from './MissingKey'
import { InvalidCoercion } from './InvalidCoercion'
import { Joint } from './Joint'

export function scope<E extends ContentedError>(
  path: Path,
  err: E
): HasMissingKey<E> | HasAtKeyInvalidCoercion<E> | HasJointAtKey<E> {
  if (err instanceof AtKey) {
    return new AtKey(
      path.concat(err.at),
      err.error
    ) as HasAtKeyInvalidCoercion<E>
  }
  if (err instanceof MissingKey) {
    return new MissingKey(path.concat(err.missingKey)) as HasMissingKey<E>
  }
  if (err instanceof InvalidCoercion) {
    return new AtKey(path, err) as HasAtKeyInvalidCoercion<E>
  }
  if (err instanceof Joint) {
    return new Joint(
      err.errors.map((error: ContentedError) => scope(path, error))
    ) as HasJointAtKey<E>
  }
  /* c8 ignore next */
  throw new Error(`Unknown error type: ${err}`)
}

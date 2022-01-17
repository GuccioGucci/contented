import { test } from 'uvu'
import assert from 'uvu/assert'
import { many } from './array'
import { InvalidCoercion } from './InvalidCoercion'
import { at, AtKey, MissingKey } from './key'
import { coerce } from './To'
import { toString } from './toString'

test(`array`, function () {
  const toArrayOfStrings = many(toString)

  const res = coerce(toArrayOfStrings, ['a', 'b', 'c'])

  assert.equal(res, ['a', 'b', 'c'])
})

test('not an array', function () {
  const toArrayOfStrings = many(toString)

  const res = coerce(toArrayOfStrings, 5)

  assert.equal(res, new InvalidCoercion('array', 5))
})

test('not right element', function () {
  const toArrayOfStrings = many(toString)

  const res = coerce(toArrayOfStrings, [1, 2, 3])

  assert.equal(res, new AtKey([0], new InvalidCoercion('string', 1)))
})

test('not right nested element', function () {
  const toArrayOfStrings = many(at(['a'], toString))

  const res = coerce(toArrayOfStrings, [{ a: 5 }])

  assert.equal(res, new AtKey([0, 'a'], new InvalidCoercion('string', 5)))
})

test('missing element', function () {
  const toArrayOfStrings = many(at(['a'], toString))

  const res = coerce(toArrayOfStrings, [{ b: 0 }, { b: 1 }, { b: 2 }])

  assert.equal(res, new MissingKey([0, 'a']))
})

test.run()

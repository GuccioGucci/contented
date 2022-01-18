import { test } from 'uvu'
import assert from 'uvu/assert'
import { arrayOf } from './array'
import { InvalidCoercion } from './InvalidCoercion'
import { at, AtKey, MissingKey } from './key'
import { coerceTo } from './To'
import { string } from './string'

test(`array`, function () {
  const arrayOfStrings = arrayOf(string)

  const res = coerceTo(arrayOfStrings, ['a', 'b', 'c'])

  assert.equal(res, ['a', 'b', 'c'])
})

test('not an array', function () {
  const arrayOfStrings = arrayOf(string)

  const res = coerceTo(arrayOfStrings, 5)

  assert.equal(res, new InvalidCoercion('array', 5))
})

test('not right element', function () {
  const arrayOfStrings = arrayOf(string)

  const res = coerceTo(arrayOfStrings, [1, 2, 3])

  assert.equal(res, new AtKey([0], new InvalidCoercion('string', 1)))
})

test('not right nested element', function () {
  const arrayOfStrings = arrayOf(at(['a'], string))

  const res = coerceTo(arrayOfStrings, [{ a: 5 }])

  assert.equal(res, new AtKey([0, 'a'], new InvalidCoercion('string', 5)))
})

test('missing element', function () {
  const arrayOfStrings = arrayOf(at(['a'], string))

  const res = coerceTo(arrayOfStrings, [{ b: 0 }, { b: 1 }, { b: 2 }])

  assert.equal(res, new MissingKey([0, 'a']))
})

test.run()

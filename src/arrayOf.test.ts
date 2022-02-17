import { test } from 'uvu'
import assert from 'uvu/assert'
import { coerceTo } from './Type'
import { number } from './number'
import { string } from './string'
import { AtKey, InvalidCoercion } from './error/InvalidCoercion'
import { MissingKey } from './error/MissingKey'
import { Joint } from './error/Joint'
import { at } from './at'
import { arrayOf } from './arrayOf'
import { permissiveArrayOf } from './permissiveArrayOf'

test(`array accepts array of the indicated element type`, function () {
  const arrayOfStrings = arrayOf(string)

  const res = coerceTo(arrayOfStrings, ['a', 'b', 'c'])

  assert.equal(res, ['a', 'b', 'c'])
})

test('array rejects values that are not arrays', function () {
  const arrayOfStrings = arrayOf(string)

  const res = coerceTo(arrayOfStrings, 5)

  assert.equal(res, new InvalidCoercion('array', 5))
})

test('array rejects arrays of the wrong element type', function () {
  const arrayOfStrings = arrayOf(string)

  const res = coerceTo(arrayOfStrings, [1, 2, 3])

  assert.equal(res, new AtKey([0], new InvalidCoercion('string', 1)))
})

test('array reports nested errors', function () {
  const arrayOfStrings = arrayOf(at('a', string))

  const res = coerceTo(arrayOfStrings, [{ a: 5 }])

  assert.equal(res, new AtKey([0, 'a'], new InvalidCoercion('string', 5)))
})

test('array rejects a value upon the first missing element', function () {
  const arrayOfStrings = arrayOf(at('a', string))

  const res = coerceTo(arrayOfStrings, [{ b: 0 }, { b: 1 }, { b: 2 }])

  assert.equal(res, new MissingKey([0, 'a']))
})

test(`array propagates non fatal errors`, function () {
  const arrayOfPermissiveArray = arrayOf(permissiveArrayOf(number))

  const res1 = coerceTo(arrayOfPermissiveArray, [[1, 2, 3, 'hello']])
  const res2 = coerceTo(arrayOfPermissiveArray, [1, [1, 2, 3, 'hello']])

  assert.equal(res1, [
    [[1, 2, 3]],
    [new AtKey([0, 3], new InvalidCoercion('number', 'hello'))],
  ])
  assert.equal(res2, new AtKey([0], new InvalidCoercion('array', 1)))
})

test(`array accepts alternatives`, function () {
  const arrayOfAlternatives = arrayOf(string.or(at('a', number)))

  const res1 = coerceTo(arrayOfAlternatives, ['x', 'y', { a: 12 }])
  const res2 = coerceTo(arrayOfAlternatives, ['x', 'y', false])

  assert.equal(res1, ['x', 'y', 12])
  assert.equal(
    res2,
    new Joint([
      new AtKey([2], new InvalidCoercion('string', false)),
      new AtKey([2], new InvalidCoercion('object', false)),
    ])
  )
})

test.run()

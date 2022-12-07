import { test } from 'uvu'
import assert from 'uvu/assert'
import { coerceTo } from './v4/coerceTo'
import { number } from './v4/Type'
import { string } from './v4/Type'
import { AtKey, InvalidCoercion } from './InvalidCoercion'
import { MissingKey } from './MissingKey'
import { Joint } from './Joint'
import { arrayOf } from './v4/Type'
import { object } from './v4/Type'
import { oneOf } from './v4/Type'

test(`array accepts array of the indicated element type`, function () {
  const arrayOfStrings = arrayOf(string)

  const res = coerceTo(arrayOfStrings, ['a', 'b', 'c'])

  assert.equal(res, ['a', 'b', 'c'])
})

test(`array rejects values that are not arrays`, function () {
  const arrayOfStrings = arrayOf(string)

  const res = coerceTo(arrayOfStrings, 5)

  assert.equal(res, new InvalidCoercion('array', 5))
})

test(`array rejects arrays of the wrong element type`, function () {
  const arrayOfStrings = arrayOf(string)

  const res = coerceTo(arrayOfStrings, [1, 2, 3])

  assert.equal(res, new AtKey([0], new InvalidCoercion('string', 1)))
})

test(`array reports nested errors`, function () {
  const arrayOfStrings = arrayOf(object({ a: string }))

  const res = coerceTo(arrayOfStrings, [{ a: 5 }])

  assert.equal(res, new AtKey([0, 'a'], new InvalidCoercion('string', 5)))
})

test(`array rejects a value upon the first missing element`, function () {
  const arrayOfStrings = arrayOf(object({ a: string }))

  const res = coerceTo(arrayOfStrings, [{ b: 0 }, { b: 1 }, { b: 2 }])

  assert.equal(res, new MissingKey([0, 'a']))
})

test(`array accepts alternatives`, function () {
  const arrayOfAlternatives = arrayOf(oneOf(string, object({ a: number })))

  const res1 = coerceTo(arrayOfAlternatives, ['x', 'y', { a: 12 }])
  const res2 = coerceTo(arrayOfAlternatives, ['x', 'y', false])
  const res3 = coerceTo(arrayOfAlternatives, ['x', 'y', { a: 'hello' }])

  assert.equal(res1, ['x', 'y', { a: 12 }])
  assert.equal(
    res2,
    new Joint([
      new AtKey([2], new InvalidCoercion('string', false)),
      new AtKey([2], new InvalidCoercion('object', false)),
    ])
  )
  assert.equal(
    res3,
    new Joint([
      new AtKey([2], new InvalidCoercion('string', { a: 'hello' })),
      new AtKey([2, 'a'], new InvalidCoercion('number', 'hello')),
    ])
  )
})

test.run()

import { test } from 'uvu'
import assert from 'uvu/assert'
import { isValid } from './isValid'
import { explain } from './explain'
import { number } from './number'
import { string } from './string'
import { arrayOf } from './arrayOf'
import { object } from './object'
import { oneOf } from './oneOf'

test(`array accepts array of the indicated element type`, function () {
  const arrayOfStrings = arrayOf(string)

  const res = isValid(arrayOfStrings, ['a', 'b', 'c'])

  assert.is(res, true)
})

test(`array rejects values that are not arrays`, function () {
  const arrayOfStrings = arrayOf(string)

  const res = isValid(arrayOfStrings, 5)

  assert.is(res, false)
})

test(`there is an explanation if the value is not an array`, function () {
  const arrayOfStrings = arrayOf(string)

  const exp = explain(arrayOfStrings, 5)
  assert.equal(exp, {
    value: 5,
    isNot: { arrayOf: 'string' },
  })
})

test(`array rejects arrays of the wrong element type`, function () {
  const arrayOfStrings = arrayOf(string)

  const res = isValid(arrayOfStrings, [1, 2, 3])

  assert.is(res, false)
})

test(`there is an explanation if elements are of the wrong type`, function () {
  const arrayOfStrings = arrayOf(string)

  const exp = explain(arrayOfStrings, [1, 2, 3])
  assert.equal(exp, {
    value: [1, 2, 3],
    isNot: { arrayOf: 'string' },
    since: [
      { atKey: 0, value: 1, isNot: 'string' },
      { atKey: 1, value: 2, isNot: 'string' },
      { atKey: 2, value: 3, isNot: 'string' },
    ],
  })
})

test(`array reports nested errors`, function () {
  const arrayOfObjs = arrayOf(object({ a: string }))

  const res = isValid(arrayOfObjs, [{ a: 5 }])

  assert.is(res, false)
})

test(`there is an explanation for the presence of nested errors`, function () {
  const arrayOfObjs = arrayOf(object({ a: string }))

  const exp = explain(arrayOfObjs, [{ a: 5 }])

  assert.equal(exp, {
    value: [{ a: 5 }],
    isNot: { arrayOf: { object: { a: 'string' } } },
    since: [
      {
        atKey: 0,
        value: { a: 5 },
        isNot: { object: { a: 'string' } },
        since: [
          {
            atKey: 'a',
            value: 5,
            isNot: 'string',
          },
        ],
      },
    ],
  })
})

test(`array rejects a value upon the first missing element`, function () {
  const arrayOfObjs = arrayOf(object({ a: string }))

  const res = isValid(arrayOfObjs, [{ b: 0 }, { b: 1 }, { b: 2 }])

  assert.is(res, false)
})

test(`there is an explanation when there are missing elements`, function () {
  const arrayOfObjs = arrayOf(object({ a: string }))

  const exp = explain(arrayOfObjs, [{ b: 0 }, { b: 1 }, { b: 2 }])
  assert.equal(exp, {
    value: [{ b: 0 }, { b: 1 }, { b: 2 }],
    isNot: { arrayOf: { object: { a: 'string' } } },
    since: [
      {
        atKey: 0,
        value: { b: 0 },
        isNot: { object: { a: 'string' } },
        since: [{ missingKey: 'a' }],
      },
      {
        atKey: 1,
        value: { b: 1 },
        isNot: { object: { a: 'string' } },
        since: [{ missingKey: 'a' }],
      },
      {
        atKey: 2,
        value: { b: 2 },
        isNot: { object: { a: 'string' } },
        since: [{ missingKey: 'a' }],
      },
    ],
  })
})

test(`array accepts alternatives`, function () {
  const arrayOfAlternatives = arrayOf(oneOf(string, object({ a: number })))

  const res1 = isValid(arrayOfAlternatives, ['x', 'y', { a: 12 }])
  const res2 = isValid(arrayOfAlternatives, ['x', 'y', false])
  const res3 = isValid(arrayOfAlternatives, ['x', 'y', { a: 'hello' }])

  assert.is(res1, true)
  assert.is(res2, false)
  assert.is(res3, false)
})

test.run()

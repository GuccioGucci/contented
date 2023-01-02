import { test } from 'uvu'
import assert from 'uvu/assert'
import { coerceTo } from './coercion'
import { explain } from './explain'
import { number } from './number'
import { string } from './string'
import { arrayOf } from './arrayOf'
import { object } from './object'
import { oneOf } from './oneOf'

test(`array accepts array of the indicated element type`, function () {
  const arrayOfStrings = arrayOf(string)

  const res = coerceTo(arrayOfStrings, ['a', 'b', 'c'])

  assert.equal(res, ['a', 'b', 'c'])
})

test(`array rejects values that are not arrays`, function () {
  const arrayOfStrings = arrayOf(string)

  const res = coerceTo(arrayOfStrings, 5)

  assert.is(res, undefined)
})

test(`there is an explanation if the value is not an array`, function () {
  const arrayOfStrings = arrayOf(string)

  const why = explain(arrayOfStrings, 5)
  assert.equal(why, {
    value: 5,
    not: { arrayOf: 'string' },
    cause: [
      {
        value: 5,
        not: { arrayOf: 'string' },
      },
    ],
  })
})

test(`array rejects arrays of the wrong element type`, function () {
  const arrayOfStrings = arrayOf(string)

  const res = coerceTo(arrayOfStrings, [1, 2, 3])

  assert.is(res, undefined)
})

test(`there is an explanation if elements are of the wrong type`, function () {
  const arrayOfStrings = arrayOf(string)

  const why = explain(arrayOfStrings, [1, 2, 3])
  assert.equal(why, {
    value: [1, 2, 3],
    not: { arrayOf: 'string' },
    cause: [
      { atKey: 0, value: 1, not: 'string', cause: [{ value: 1, not: 'string' }] }, // FIXME: remove extra cause
      { atKey: 1, value: 2, not: 'string', cause: [{ value: 2, not: 'string' }] },
      { atKey: 2, value: 3, not: 'string', cause: [{ value: 3, not: 'string' }] },
    ],
  })
})

test(`array reports nested errors`, function () {
  const arrayOfObjs = arrayOf(object({ a: string }))

  const res = coerceTo(arrayOfObjs, [{ a: 5 }])

  assert.is(res, undefined)
})

test(`there is an explanation for the presence of nested errors`, function () {
  const arrayOfObjs = arrayOf(object({ a: string }))

  const why = explain(arrayOfObjs, [{ a: 5 }])

  assert.equal(why, {
    value: [{ a: 5 }],
    not: { arrayOf: { object: { a: 'string' } } },
    cause: [
      {
        atKey: 0,
        value: { a: 5 },
        not: { object: { a: 'string' } },
        cause: [
          {
            atKey: 'a',
            value: 5,
            not: 'string',
            cause: [{ value: 5, not: 'string' }], // FIXME: remove extra cause
          },
        ],
      },
    ],
  })
})

test(`array rejects a value upon the first missing element`, function () {
  const arrayOfObjs = arrayOf(object({ a: string }))

  const res = coerceTo(arrayOfObjs, [{ b: 0 }, { b: 1 }, { b: 2 }])

  assert.is(res, undefined)
})

test(`there is an explanation when there are missing elements`, function () {
  const arrayOfObjs = arrayOf(object({ a: string }))

  const why = explain(arrayOfObjs, [{ b: 0 }, { b: 1 }, { b: 2 }])
  assert.equal(why, {
    value: [{ b: 0 }, { b: 1 }, { b: 2 }],
    not: { arrayOf: { object: { a: 'string' } } },
    cause: [
      {
        atKey: 0,
        value: { b: 0 },
        not: { object: { a: 'string' } },
        cause: [{ missingKey: 'a' }],
      },
      {
        atKey: 1,
        value: { b: 1 },
        not: { object: { a: 'string' } },
        cause: [{ missingKey: 'a' }],
      },
      {
        atKey: 2,
        value: { b: 2 },
        not: { object: { a: 'string' } },
        cause: [{ missingKey: 'a' }],
      },
    ],
  })
})

test(`array accepts alternatives`, function () {
  const arrayOfAlternatives = arrayOf(oneOf(string, object({ a: number })))

  const res1 = coerceTo(arrayOfAlternatives, ['x', 'y', { a: 12 }])
  const res2 = coerceTo(arrayOfAlternatives, ['x', 'y', false])
  const res3 = coerceTo(arrayOfAlternatives, ['x', 'y', { a: 'hello' }])

  assert.equal(res1, ['x', 'y', { a: 12 }])
  assert.is(res2, undefined)
  assert.is(res3, undefined)
})

test.run()

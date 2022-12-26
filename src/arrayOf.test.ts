import { test } from 'uvu'
import assert from 'uvu/assert'
import { AtKey, InvalidType, MissingKey, Joint, coerceTo } from './coercion'
import { number } from './number'
import { string } from './string'
import { arrayOf } from './arrayOf'
import { object } from './object'
import { oneOf } from './oneOf'
import { explain } from './explain'

test(`array accepts array of the indicated element type`, function () {
  const arrayOfStrings = arrayOf(string)

  const res = coerceTo(arrayOfStrings, ['a', 'b', 'c'])

  assert.equal(res, ['a', 'b', 'c'])
})

test(`array rejects values that are not arrays`, function () {
  const arrayOfStrings = arrayOf(string)

  const res = coerceTo(arrayOfStrings, 5)

  assert.equal(res, new InvalidType('array', 5))
})

test(`there is an explanation if the value is not an array`, function () {
  const arrayOfStrings = arrayOf(string)

  const why = explain(arrayOfStrings, 5)
  assert.equal(why, {
    value: 5,
    not: { arrayOf: 'string' },
    cause: [new InvalidType('array', 5)],
  })
})

test(`array rejects arrays of the wrong element type`, function () {
  const arrayOfStrings = arrayOf(string)

  const res = coerceTo(arrayOfStrings, [1, 2, 3])

  assert.equal(res, new AtKey([0], new InvalidType('string', 1)))
})

test(`there is an explanation if elements are of the wrong type`, function () {
  const arrayOfStrings = arrayOf(string)

  const why = explain(arrayOfStrings, [1, 2, 3])
  assert.equal(why, {
    value: [1, 2, 3],
    not: { arrayOf: 'string' },
    cause: [
      new AtKey([0], new InvalidType('string', 1)),
      new AtKey([1], new InvalidType('string', 2)),
      new AtKey([2], new InvalidType('string', 3)),
    ],
  })
})

test(`array reports nested errors`, function () {
  const arrayOfObjs = arrayOf(object({ a: string }))

  const res = coerceTo(arrayOfObjs, [{ a: 5 }])

  assert.equal(res, new AtKey([0, 'a'], new InvalidType('string', 5)))
})

test(`there is an explanation for the presence of nested errors`, function () {
  const arrayOfObjs = arrayOf(object({ a: string }))

  const why = explain(arrayOfObjs, [{ a: 5 }])

  assert.equal(why, {
    value: [{ a: 5 }],
    not: { arrayOf: { object: { a: 'string' } } },
    cause: [new AtKey([0, 'a'], new InvalidType('string', 5))],
  })
})

test(`array rejects a value upon the first missing element`, function () {
  const arrayOfObjs = arrayOf(object({ a: string }))

  const res = coerceTo(arrayOfObjs, [{ b: 0 }, { b: 1 }, { b: 2 }])

  assert.equal(res, new MissingKey([0, 'a']))
})

test(`there is an explanation when there are missing elements`, function () {
  const arrayOfObjs = arrayOf(object({ a: string }))

  const why = explain(arrayOfObjs, [{ b: 0 }, { b: 1 }, { b: 2 }])
  assert.equal(why, {
    value: [{ b: 0 }, { b: 1 }, { b: 2 }],
    not: { arrayOf: { object: { a: 'string' } } },
    cause: [new MissingKey([0, 'a']), new MissingKey([1, 'a']), new MissingKey([2, 'a'])],
  })
})

test(`array accepts alternatives`, function () {
  const arrayOfAlternatives = arrayOf(oneOf(string, object({ a: number })))

  const res1 = coerceTo(arrayOfAlternatives, ['x', 'y', { a: 12 }])
  const res2 = coerceTo(arrayOfAlternatives, ['x', 'y', false])
  const res3 = coerceTo(arrayOfAlternatives, ['x', 'y', { a: 'hello' }])

  assert.equal(res1, ['x', 'y', { a: 12 }])
  assert.equal(
    res2,
    new Joint([new AtKey([2], new InvalidType('string', false)), new AtKey([2], new InvalidType('object', false))])
  )
  assert.equal(
    res3,
    new Joint([
      new AtKey([2], new InvalidType('string', { a: 'hello' })),
      new AtKey([2, 'a'], new InvalidType('number', 'hello')),
    ])
  )
})

test.run()

import { test } from 'uvu'
import assert from 'uvu/assert'
import { number } from './number'
import { string } from './string'
import { oneOf } from './oneOf'
import { boolean } from './boolean'
import { literal } from './literal'
import { object } from './object'
import { coerceTo } from './coercion'
import { explain } from './explain'

test(`oneOf allows specifying alternatives`, function () {
  const T = oneOf(string, object({ b: number }), boolean)

  const res1 = coerceTo(T, 'hello')
  const res2 = coerceTo(T, { b: 15 })
  const res3 = coerceTo(T, true)

  assert.is(res1, 'hello')
  assert.equal(res2, { b: 15 })
  assert.is(res3, true)
})

test(`oneOf rejects input values that are not coercible to any given alternative`, function () {
  const T = oneOf(literal('a'), literal('b'), literal('c'))

  const res1 = coerceTo(T, true)
  const res2 = coerceTo(T, { a: 2 })

  assert.is(res1, undefined)
  assert.is(res2, undefined)
})

test(`there is an explanation if the input value is not coercibile to any given alternative`, function () {
  const T = oneOf(literal('a'), literal('b'), literal('c'))

  const why1 = explain(T, true)
  const why2 = explain(T, { a: 2 })

  assert.equal(why1, {
    value: true,
    isNot: { oneOf: [{ literal: 'a' }, { literal: 'b' }, { literal: 'c' }] },
    cause: [
      { value: true, isNot: { literal: 'a' } },
      { value: true, isNot: { literal: 'b' } },
      { value: true, isNot: { literal: 'c' } },
    ],
  })
  assert.equal(why2, {
    value: { a: 2 },
    isNot: { oneOf: [{ literal: 'a' }, { literal: 'b' }, { literal: 'c' }] },
    cause: [
      { value: { a: 2 }, isNot: { literal: 'a' } },
      { value: { a: 2 }, isNot: { literal: 'b' } },
      { value: { a: 2 }, isNot: { literal: 'c' } },
    ],
  })
})

test(`oneOf reports the path at which the error happened`, function () {
  const stringOrNumberAtA = oneOf(string, object({ a: number }))

  const res1 = coerceTo(stringOrNumberAtA, { b: 12 })
  const res2 = coerceTo(stringOrNumberAtA, { a: 'hello' })

  assert.is(res1, undefined)
  assert.is(res2, undefined)
})

test(`the explanation mentions the path at which the error happened`, function () {
  const stringOrNumberAtA = oneOf(string, object({ a: number }))

  const why1 = explain(stringOrNumberAtA, { b: 12 })
  const why2 = explain(stringOrNumberAtA, { a: 'hello' })

  assert.equal(why1, {
    value: { b: 12 },
    isNot: { oneOf: ['string', { object: { a: 'number' } }] },
    cause: [
      {
        value: { b: 12 },
        isNot: 'string',
      },
      {
        value: { b: 12 },
        isNot: { object: { a: 'number' } },
        cause: [{ missingKey: 'a' }],
      },
    ],
  })
  assert.equal(why2, {
    value: { a: 'hello' },
    isNot: { oneOf: ['string', { object: { a: 'number' } }] },
    cause: [
      {
        value: { a: 'hello' },
        isNot: 'string',
      },
      {
        value: { a: 'hello' },
        isNot: { object: { a: 'number' } },
        cause: [{ atKey: 'a', value: 'hello', isNot: 'number' }],
      },
    ],
  })
})

test(`oneOf reports multi-level missing keys`, function () {
  const T = object({ a: oneOf(string, object({ b: number })) })

  const res1 = coerceTo(T, { b: 12 })
  const res2 = coerceTo(T, { a: { c: 12 } })

  assert.is(res1, undefined)
  assert.is(res2, undefined)
})

test(`there is an explanation in case of multi-level missing keys`, function () {
  const T = object({ a: oneOf(string, object({ b: number })) })

  const why1 = explain(T, { b: 12 })
  const why2 = explain(T, { a: { c: 12 } })

  assert.equal(why1, {
    value: { b: 12 },
    isNot: { object: { a: { oneOf: ['string', { object: { b: 'number' } }] } } },
    cause: [{ missingKey: 'a' }],
  })
  assert.equal(why2, {
    value: { a: { c: 12 } },
    isNot: { object: { a: { oneOf: ['string', { object: { b: 'number' } }] } } },
    cause: [
      {
        atKey: 'a',
        value: { c: 12 },
        isNot: { oneOf: ['string', { object: { b: 'number' } }] },
        cause: [
          {
            value: { c: 12 },
            isNot: 'string',
          },
          {
            value: { c: 12 },
            isNot: { object: { b: 'number' } },
            cause: [{ missingKey: 'b' }],
          },
        ],
      },
    ],
  })
})

test.run()

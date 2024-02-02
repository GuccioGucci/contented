import { test } from 'uvu'
import assert from 'uvu/assert'
import { number } from './number'
import { string } from './string'
import { oneOf } from './oneOf'
import { boolean } from './boolean'
import { literal } from './literal'
import { object } from './object'
import { isValid } from './isValid'
import { explain } from './explain'

test(`oneOf allows specifying alternatives`, function () {
  const T = oneOf(string, object({ b: number }), boolean)

  const res1 = isValid(T, 'hello')
  const res2 = isValid(T, { b: 15 })
  const res3 = isValid(T, false)

  assert.is(res1, true)
  assert.is(res2, true)
  assert.is(res3, true)
})

test(`oneOf rejects input values that are not coercible to any given alternative`, function () {
  const T = oneOf(literal('a'), literal('b'), literal('c'))

  const res1 = isValid(T, true)
  const res2 = isValid(T, { a: 2 })

  assert.is(res1, false)
  assert.is(res2, false)
})

test(`there is an explanation if the input value is not coercible to any given alternative`, function () {
  const T = oneOf(literal('a'), literal('b'), literal('c'))

  const exp1 = explain(T, true)
  const exp2 = explain(T, { a: 2 })

  assert.equal(exp1, {
    value: true,
    isNot: { oneOf: [{ literal: 'a' }, { literal: 'b' }, { literal: 'c' }] },
    since: [
      { value: true, isNot: { literal: 'a' } },
      { value: true, isNot: { literal: 'b' } },
      { value: true, isNot: { literal: 'c' } },
    ],
  })
  assert.equal(exp2, {
    value: { a: 2 },
    isNot: { oneOf: [{ literal: 'a' }, { literal: 'b' }, { literal: 'c' }] },
    since: [
      { value: { a: 2 }, isNot: { literal: 'a' } },
      { value: { a: 2 }, isNot: { literal: 'b' } },
      { value: { a: 2 }, isNot: { literal: 'c' } },
    ],
  })
})

test(`the explanation mentions the path at which the error happened`, function () {
  const stringOrNumberAtA = oneOf(string, object({ a: number }))

  const exp1 = explain(stringOrNumberAtA, { b: 12 })
  const exp2 = explain(stringOrNumberAtA, { a: 'hello' })

  assert.equal(exp1, {
    value: { b: 12 },
    isNot: { oneOf: ['string', { object: { a: 'number' } }] },
    since: [
      {
        value: { b: 12 },
        isNot: 'string',
      },
      {
        value: { b: 12 },
        isNot: { object: { a: 'number' } },
        since: [{ missingKey: 'a' }],
      },
    ],
  })
  assert.equal(exp2, {
    value: { a: 'hello' },
    isNot: { oneOf: ['string', { object: { a: 'number' } }] },
    since: [
      {
        value: { a: 'hello' },
        isNot: 'string',
      },
      {
        value: { a: 'hello' },
        isNot: { object: { a: 'number' } },
        since: [{ atKey: 'a', value: 'hello', isNot: 'number' }],
      },
    ],
  })
})

test(`oneOf reports multi-level missing keys`, function () {
  const T = object({ a: oneOf(string, object({ b: number })) })

  const res1 = isValid(T, { b: 12 })
  const res2 = isValid(T, { a: { c: 12 } })

  assert.is(res1, false)
  assert.is(res2, false)
})

test(`there is an explanation in case of multi-level missing keys`, function () {
  const T = object({ a: oneOf(string, object({ b: number })) })

  const exp1 = explain(T, { b: 12 })
  const exp2 = explain(T, { a: { c: 12 } })

  assert.equal(exp1, {
    value: { b: 12 },
    isNot: { object: { a: { oneOf: ['string', { object: { b: 'number' } }] } } },
    since: [{ missingKey: 'a' }],
  })
  assert.equal(exp2, {
    value: { a: { c: 12 } },
    isNot: { object: { a: { oneOf: ['string', { object: { b: 'number' } }] } } },
    since: [
      {
        atKey: 'a',
        value: { c: 12 },
        isNot: { oneOf: ['string', { object: { b: 'number' } }] },
        since: [
          {
            value: { c: 12 },
            isNot: 'string',
          },
          {
            value: { c: 12 },
            isNot: { object: { b: 'number' } },
            since: [{ missingKey: 'b' }],
          },
        ],
      },
    ],
  })
})

test.run()

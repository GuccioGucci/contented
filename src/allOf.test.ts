import { test } from 'uvu'
import assert from 'uvu/assert'
import { object } from './object'
import { number } from './number'
import { isValid } from './isValid'
import { allOf } from './allOf'
import { explain } from './explain'

test(`allOf allows specifying intersections`, function () {
  const T = allOf(object({ a: number }), object({ b: number }))

  const res1 = isValid(T, { a: 10, b: 20 })
  const res2 = isValid(T, { a: 10, b: 20, c: 30 })

  assert.is(res1, true)
  assert.is(res2, true)
})

test('allOf rejects input values that are not coercible to all given types', function () {
  const T = allOf(object({ a: number }), object({ b: number }))

  const res1 = isValid(T, { a: 10 })
  const res2 = isValid(T, { b: 20 })
  const res3 = isValid(T, { c: 30 })
  const res4 = isValid(T, 'hello')

  assert.is(res1, false)
  assert.is(res2, false)
  assert.is(res3, false)
  assert.is(res4, false)
})

test(`there is an explanation if the input value is not coercibile to any given type`, function () {
  const T = allOf(object({ a: number }), object({ b: number }))

  const exp1 = explain(T, { a: 10 })
  const exp2 = explain(T, { c: 30 })

  assert.equal(exp1, {
    value: { a: 10 },
    isNot: { allOf: [{ object: { a: 'number' } }, { object: { b: 'number' } }] },
    since: [
      {
        value: { a: 10 },
        isNot: { object: { b: 'number' } },
        since: [{ missingKey: 'b' }],
      },
    ],
  })

  assert.equal(exp2, {
    value: { c: 30 },
    isNot: { allOf: [{ object: { a: 'number' } }, { object: { b: 'number' } }] },
    since: [
      {
        value: { c: 30 },
        isNot: { object: { a: 'number' } },
        since: [{ missingKey: 'a' }],
      },
      {
        value: { c: 30 },
        isNot: { object: { b: 'number' } },
        since: [{ missingKey: 'b' }],
      },
    ],
  })
})

test.run()

import { test } from 'uvu'
import assert from 'uvu/assert'
import { number } from './number'
import { object } from './object'
import { string } from './string'
import { isValid } from './isValid'
import { explain } from './explain'

test(`object succeeds if the input data is an object adhering to the expectations`, function () {
  const Point = object({ x: string, y: number })

  const res = isValid(Point, { x: 'hello', y: 12 })

  assert.is(res, true)
})

test(`object fails if the input data is not an object`, function () {
  const Point = object({ x: string, y: number })

  const res = isValid(Point, 'hello')

  assert.is(res, false)
})

test(`there is an explanation if the input data is not an object`, function () {
  const Point = object({ x: string, y: number })

  const exp = explain(Point, 'hello')

  assert.equal(exp, {
    value: 'hello',
    isNot: { object: { x: 'string', y: 'number' } },
  })
})

test(`object rejects the input data upon the first missing element`, function () {
  const Point = object({ x: string, y: number })

  const res = isValid(Point, { x: 'hello' })

  assert.is(res, false)
})

test(`there is an explanation if the input data is missing one or more keys`, function () {
  const Point = object({ x: string, y: number })

  const exp1 = explain(Point, {})
  const exp2 = explain(Point, { x: 'hello' })

  assert.equal(exp1, {
    value: {},
    isNot: { object: { x: 'string', y: 'number' } },
    since: [{ missingKey: 'x' }, { missingKey: 'y' }],
  })

  assert.equal(exp2, {
    value: { x: 'hello' },
    isNot: { object: { x: 'string', y: 'number' } },
    since: [{ missingKey: 'y' }],
  })
})

test(`object rejects the input data upon the first mismatching element`, function () {
  const Point = object({ x: string, y: number })

  const res = isValid(Point, { x: 'hello', y: false })

  assert.is(res, false)
})

test(`there is an explanation if the input data presents invalid properties`, function () {
  const Point = object({ x: string, y: number })

  const exp = explain(Point, { x: true, y: false })
  assert.equal(exp, {
    value: { x: true, y: false },
    isNot: { object: { x: 'string', y: 'number' } },
    since: [
      { atKey: 'x', value: true, isNot: 'string' },
      { atKey: 'y', value: false, isNot: 'number' },
    ],
  })
})

test(`object marks optional fields by ending keys with ?`, function () {
  const obj = object({ 'x?': string, y: number })

  const res1 = isValid(obj, { x: 'hello', y: 20 })
  const res2 = isValid(obj, { x: undefined, y: 20 })
  const res3 = isValid(obj, { y: 20 })

  assert.is(res1, true)
  assert.is(res2, true)
  assert.is(res3, true)
})

test(`null is not an object`, function () {
  const obj = object({})

  const res = isValid(obj, null)

  assert.is(res, false)
})

test(`explain that null is not an object`, function () {
  const obj = object({})

  const exp = explain(obj, null)

  assert.equal(exp, {
    value: null,
    isNot: { object: {} },
  })
})

test.run()

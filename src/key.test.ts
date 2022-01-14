import { test } from 'uvu'
import assert from 'uvu/assert'
import { coerce } from './To'
import { toNumber } from './toNumber'
import { toString } from './toString'
import { at, fallback, MissingKey } from './key'

test(`at leads to the value of an object's property`, function () {
  const cToNumber = at(['a', 'b', 'c'], toNumber)

  const c = coerce({ a: { b: { c: 12 } } }, cToNumber)

  assert.is(c, 12)
})

test(`at supports navigating an array when numeric keys are used`, function () {
  const lastToString = at([2], toString)
  const bToNumber = at(['a', 1, 'b'], toNumber)

  const last = coerce(['b', 'c', 'd'], lastToString)
  const b = coerce({ a: [{ b: 1 }, { b: 2 }] }, bToNumber)

  assert.is(last, 'd')
  assert.is(b, 2)
})

test(`pointing to a non-existing property reports when the path got interrupted`, function () {
  const cToNumber = at(['a', 'b', 'c'], toNumber)

  const c1 = coerce({ a: 2 }, cToNumber)
  const c2 = coerce({ a: { b: 3 } }, cToNumber)
  const c3 = coerce({ a: { b: { d: 3 } } }, cToNumber)
  const c4 = coerce({}, cToNumber)

  assert.equal(c1, new MissingKey(['a', 'b']))
  assert.equal(c2, new MissingKey(['a', 'b', 'c']))
  assert.equal(c3, new MissingKey(['a', 'b', 'c']))
  assert.equal(c4, new MissingKey(['a']))
})

test(`fallback returns a fallback value in case of an interrupted path towards a key`, function () {
  const cToNumber = fallback(at(['a', 'b', 'c'], toNumber), 42)

  const c1 = coerce({ a: 2 }, cToNumber)
  const c2 = coerce({ a: { b: 3 } }, cToNumber)
  const c3 = coerce({ a: { b: { d: 3 } } }, cToNumber)

  assert.is(c1, 42)
  assert.is(c2, 42)
  assert.is(c3, 42)
})

test.run()

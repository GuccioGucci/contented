import { test } from 'uvu'
import assert from 'uvu/assert'
import { coerce, InvalidCoercion } from './To'
import { at, MissingKey } from './at'
import { toNumber } from './toNumber'
import { toString } from './toString'

test(`at leads to the value of an object's property`, function () {
  const toC = at(['a', 'b', 'c'], toNumber)

  const c = coerce({ a: { b: { c: 12 } } }, toC)

  assert.is(c, 12)
})

test(`at supports navigating an array when numeric keys are used`, function () {
  const toLast = at([2], toString)
  const toB = at(['a', 1, 'b'], toNumber)

  const last = coerce(['b', 'c', 'd'], toLast)
  const b = coerce({ a: [{ b: 1 }, { b: 2 }] }, toB)

  assert.is(last, 'd')
  assert.is(b, 2)
})

test(`a path to a non-existing property reports when the path got interrupted`, function () {
  const toC = at(['a', 'b', 'c'], toNumber)

  const c1 = coerce({ a: 2 }, toC)
  const c2 = coerce({ a: { b: 3 } }, toC)
  const c3 = coerce({ a: { b: { d: 3 } } }, toC)
  const c4 = coerce({}, toC)

  assert.equal(c1, new MissingKey(['a', 'b']))
  assert.equal(c2, new MissingKey(['a', 'b', 'c']))
  assert.equal(c3, new MissingKey(['a', 'b', 'c']))
  assert.equal(c4, new MissingKey(['a']))
})

test('at', function () {
  const toC = at(['a', 'b', 'c'], toString)

  const c1 = coerce({ a: { b: { c: 'foo' } } }, toC)
  const c2 = coerce({ a: 2 }, toC)
  const c3 = coerce({ a: { b: 2 } }, toC)
  const c4 = coerce({ a: { b: { c: 12 } } }, toC)
  const c5 = coerce(undefined, toC)

  assert.equal(c1, 'foo')
  assert.equal(c2, new MissingKey(['a', 'b']))
  assert.equal(c3, new MissingKey(['a', 'b', 'c']))
  assert.equal(c4, new InvalidCoercion('string', 12))
  assert.equal(c5, new MissingKey(['a']))
})

test.run()

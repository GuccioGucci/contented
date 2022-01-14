import { test } from 'uvu'
import assert from 'uvu/assert'
import { coerce } from './To'
import { at } from './at'
import { fallback } from './fallback'
import { toNumber } from './toNumber'

test(`fallback returns a fallback value in case of an interrupted path towards a key`, function () {
  const toC = fallback(at(['a', 'b', 'c'], toNumber), 42)

  const c1 = coerce({ a: 2 }, toC)
  const c2 = coerce({ a: { b: 3 } }, toC)
  const c3 = coerce({ a: { b: { d: 3 } } }, toC)

  assert.is(c1, 42)
  assert.is(c2, 42)
  assert.is(c3, 42)
})

test.run()

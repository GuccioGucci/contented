import { test } from 'uvu'
import assert from 'uvu/assert'
import { coerceTo } from './Type'
import { number } from './number'
import { at } from './at'
import { fallback } from './fallback'

test(`fallback returns a fallback value in case of an interrupted path towards a key`, function () {
  const cToNumber = fallback(at(['a', 'b?', 'c?'], number), 42)

  const c1 = coerceTo(cToNumber, { a: 2 })
  const c2 = coerceTo(cToNumber, { a: { b: 3 } })
  const c3 = coerceTo(cToNumber, { a: { b: { d: 3 } } })

  assert.is(c1, 42)
  assert.is(c2, 42)
  assert.is(c3, 42)
})

test(`fallback does not intervene when the path exists`, function () {
  const cToNumber = fallback(at(['a', 'b', 'c'], number), 42)

  const c = coerceTo(cToNumber, { a: { b: { c: 3 } } })

  assert.is(c, 3)
})

test.run()

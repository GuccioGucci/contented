import { test } from 'uvu'
import assert from 'uvu/assert'
import { as } from './As'
import { at } from './at'
import { fallback } from './fallback'
import { number } from './number'

test(`fallback returns a fallback value in case of an interrupted path towards a key`, function () {
  const toC = fallback(at(['a', 'b', 'c'], number), 42)

  const c1 = as(toC, { a: 2 })
  const c2 = as(toC, { a: { b: 3 } })
  const c3 = as(toC, { a: { b: { d: 3 } } })

  assert.is(c1, 42)
  assert.is(c2, 42)
  assert.is(c3, 42)
})

test.run()

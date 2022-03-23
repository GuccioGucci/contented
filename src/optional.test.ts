import { test } from 'uvu'
import assert from 'uvu/assert'
import { optional } from './optional'
import { string } from './string'
import { coerceTo } from './Type'

test(`optional makes undefined a valid input value`, function () {
  const res = coerceTo(optional(string), undefined)

  assert.equal(res, undefined)
})

test(`optional is idempotent`, function () {
  const res = coerceTo(optional(optional(string)), undefined)

  assert.equal(res, undefined)
})

test.run()

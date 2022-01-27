import { test } from 'uvu'
import assert from 'uvu/assert'
import { coerceTo } from './Type'
import { always } from './always'

test('always returns always the same output, no matter the input', function () {
  const res = coerceTo(always(10), 'hello')

  assert.equal(res, 10)
})

test.run()

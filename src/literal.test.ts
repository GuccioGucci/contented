import { test } from 'uvu'
import assert from 'uvu/assert'
import { coerceTo } from './coercion'
import { explain } from './explain'
import { literal } from './literal'

test(`literal succeds only if the input and expected values are the same`, function () {
  const ten = literal(10)

  const res1 = coerceTo(ten, 10)
  const res2 = coerceTo(ten, 'hello')
  const res3 = coerceTo(ten, { a: 1, b: 2 })

  assert.is(res1, 10)
  assert.is(res2, undefined)
  assert.is(res3, undefined)
})

test(`there is an explanation why a value is not of the expected literal type`, function () {
  const ten = literal(10)

  const exp1 = explain(ten, 'hello')
  const exp2 = explain(ten, { a: 1, b: 2 })

  assert.equal(exp1, {
    value: 'hello',
    isNot: { literal: 10 },
  })
  assert.equal(exp2, {
    value: { a: 1, b: 2 },
    isNot: { literal: 10 },
  })
})

test.run()

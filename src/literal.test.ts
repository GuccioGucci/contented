import { test } from 'uvu'
import assert from 'uvu/assert'
import { InvalidType, coerceTo } from './coercion'
import { literal } from './literal'

test(`literal succeds only if the input and expected values are the same`, function () {
  const ten = literal(10)

  const res1 = coerceTo(ten, 10)
  const res2 = coerceTo(ten, 'hello')
  const res3 = coerceTo(ten, { a: 1, b: 2 })

  assert.is(res1, 10)
  assert.equal(res2, new InvalidType('10', 'hello'))
  assert.equal(res3, new InvalidType('10', { a: 1, b: 2 }))
})

test.run()

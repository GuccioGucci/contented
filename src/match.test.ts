import { test } from 'uvu'
import assert from 'uvu/assert'
import { coerceTo } from './Type'
import { InvalidCoercion } from './InvalidCoercion'
import { match } from './match'

test(`match succeds only if the input and expected values are the same`, function () {
  const ten = match(10)

  const res1 = coerceTo(ten, 10)
  const res2 = coerceTo(ten, 'hello')
  const res3 = coerceTo(ten, { a: 1, b: 2 })

  assert.is(res1, 10)
  assert.equal(res2, new InvalidCoercion('10', 'hello'))
  assert.equal(res3, new InvalidCoercion('10', { a: 1, b: 2 }))
})

test.run()

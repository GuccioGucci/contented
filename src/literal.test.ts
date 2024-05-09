import { test } from 'uvu'
import assert from 'uvu/assert'
import { isValid } from './isValid'
import { explain } from './explain'
import { literal } from './literal'

test(`literal succeds only if the input and expected values are the same`, function () {
  const ten = literal(10)

  const res1 = isValid(ten, 10)
  const res2 = isValid(ten, 'hello')
  const res3 = isValid(ten, { a: 1, b: 2 })

  assert.is(res1, true)
  assert.is(res2, false)
  assert.is(res3, false)
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

test('bigint literals are recognized as literals', function () {
  const ten = literal(10n)

  const res1 = isValid(ten, 10n)
  const res2 = isValid(ten, 10)

  assert.is(res1, true)
  assert.is(res2, false)
})

test.run()

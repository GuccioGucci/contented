import { test } from 'uvu'
import assert from 'uvu/assert'
import { coerceTo } from './Type'
import { match } from './always'
import { InvalidCoercion, PredName } from './InvalidCoercion'

test(`match succeds only if the input and expected values are the same`, function () {
  const ten = match(10)

  const res1 = coerceTo(ten, 10)
  const res2 = coerceTo(ten, 'hello')
  const res3 = coerceTo(ten, { a: 1, b: 2 })

  assert.is(res1, 10)
  assert.equal(res2, new InvalidCoercion(new PredName(`match(10)`), 'hello'))
  assert.equal(
    res3,
    new InvalidCoercion(new PredName(`match(10)`), { a: 1, b: 2 })
  )
})

test.run()

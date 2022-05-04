import { test } from 'uvu'
import assert from 'uvu/assert'
import { coerceTo } from './Type'
import { InvalidCoercion } from './InvalidCoercion'
import { satisfy } from './satisfy'

test(`satisfy succeeds only if the input satisfies the provided type guard`, function () {
  const oddNumber = satisfy(isOdd)

  const res1 = coerceTo(oddNumber, 11)
  const res2 = coerceTo(oddNumber, 12)
  const res3 = coerceTo(oddNumber, 'hello')

  assert.is(res1, 11)
  assert.equal(res2, new InvalidCoercion('isOdd', 12))
  assert.equal(res3, new InvalidCoercion('isOdd', 'hello'))
})

test(`satisfy accepts an optional parameter with the name of the type guard`, function () {
  const oddNumber = satisfy(isOdd, 'oddNumber')

  const res2 = coerceTo(oddNumber, 12)
  const res3 = coerceTo(oddNumber, 'hello')

  assert.equal(res2, new InvalidCoercion('oddNumber', 12))
  assert.equal(res3, new InvalidCoercion('oddNumber', 'hello'))
})

test(`satisfy uses the toString() encoding of the type guard as its name as the last resort`, function () {
  const oddNumber = satisfy((x: any): x is number => isOdd(x))

  const res = coerceTo(oddNumber, 12)

  assert.equal(res, new InvalidCoercion('(x) => isOdd(x)', 12))
})

function isOdd(x: any): x is number {
  return typeof x != 'number' ? false : x % 2 === 1
}

test.run()

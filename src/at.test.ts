import { test } from 'uvu'
import assert from 'uvu/assert'
import { coerceTo } from './Type'
import { number } from './number'
import { string } from './string'
import { InvalidCoercion } from './error/InvalidCoercion'
import { MissingKey } from './error/MissingKey'
import { AtKey } from './error/AtKey'
import { at } from './at'
import { permissiveArrayOf } from './permissiveArrayOf'

test(`at leads to the value of an object's property`, function () {
  const cToNumber = at(['a', 'b', 'c'], number)

  const c = coerceTo(cToNumber, { a: { b: { c: 12 } } })

  assert.is(c, 12)
})

test(`at reports when the input value is not an object`, function () {
  const cToNumber = at(['a', 'b', 'c'], number)

  const c = coerceTo(cToNumber, 5)

  assert.equal(c, new InvalidCoercion('object', 5))
})

test(`at supports navigating an array when numeric keys are used`, function () {
  const lastToString = at(2, string)
  const bToNumber = at(['a', 1, 'b'], number)

  const last = coerceTo(lastToString, ['b', 'c', 'd'])
  const b = coerceTo(bToNumber, { a: [{ b: 1 }, { b: 2 }] })

  assert.is(last, 'd')
  assert.is(b, 2)
})

test(`pointing to a non-existing property reports when the path got interrupted`, function () {
  const cToNumber = at(['a', 'b', 'c'], number)

  const c1 = coerceTo(cToNumber, { a: 2 })
  const c2 = coerceTo(cToNumber, { a: { b: 3 } })
  const c3 = coerceTo(cToNumber, { a: { b: { d: 3 } } })
  const c4 = coerceTo(cToNumber, {})

  assert.equal(c1, new MissingKey(['a', 'b']))
  assert.equal(c2, new MissingKey(['a', 'b', 'c']))
  assert.equal(c3, new MissingKey(['a', 'b', 'c']))
  assert.equal(c4, new MissingKey(['a']))
})

test('at propagates non-fatal errors', function () {
  const thirdEl = at('a', permissiveArrayOf(number))

  const res1 = coerceTo(thirdEl, { a: 5 })
  const res2 = coerceTo(thirdEl, { b: [] })
  const res3 = coerceTo(thirdEl, { a: [1, 2, 'hello', 3, true] })

  assert.equal(res1, new AtKey(['a'], new InvalidCoercion('array', 5)))
  assert.equal(res2, new MissingKey(['a']))
  assert.equal(res3, [
    [1, 2, 3],
    [
      new AtKey(['a', 2], new InvalidCoercion('number', 'hello')),
      new AtKey(['a', 4], new InvalidCoercion('number', true)),
    ],
  ])
})

test(`any error on the value part of a property is accompanied by the property path`, function () {
  const cToNumber = at(['a', 'b', 'c'], number)

  const c1 = coerceTo(cToNumber, { a: { b: { c: 'hello' } } })

  assert.equal(
    c1,
    new AtKey(['a', 'b', 'c'], new InvalidCoercion('number', 'hello'))
  )
})

test(`it is the same to specify the path at once or incrementally`, function () {
  const cToNumber1 = at(['a', 'b', 'c'], number)
  const cToNumber2 = at('a', at('b', at('c', number)))

  const c1 = coerceTo(cToNumber1, { a: { b: { c: 'hello' } } })
  const c2 = coerceTo(cToNumber2, { a: { b: { c: 'hello' } } })

  const c3 = coerceTo(cToNumber1, { a: { b: { d: 12 } } })
  const c4 = coerceTo(cToNumber2, { a: { b: { d: 12 } } })

  assert.equal(c1, c2)
  assert.equal(c3, c4)
})

test.run()

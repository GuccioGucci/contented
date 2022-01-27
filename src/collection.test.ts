import { test } from 'uvu'
import assert from 'uvu/assert'
import { coerceTo } from './Type'
import { number } from './number'
import { string } from './string'
import {
  at,
  fallback,
  arrayOf,
  MissingKey,
  AtKey,
  combine,
  permissiveArrayOf,
} from './collection'
import { InvalidCoercion } from './InvalidCoercion'

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
  const lastToString = at([2], string)
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
  const thirdEl = at(['a'], permissiveArrayOf(number))

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
  const cToNumber2 = at(['a'], at(['b'], at(['c'], number)))

  const c1 = coerceTo(cToNumber1, { a: { b: { c: 'hello' } } })
  const c2 = coerceTo(cToNumber2, { a: { b: { c: 'hello' } } })

  const c3 = coerceTo(cToNumber1, { a: { b: { d: 12 } } })
  const c4 = coerceTo(cToNumber2, { a: { b: { d: 12 } } })

  assert.equal(c1, c2)
  assert.equal(c3, c4)
})

test(`fallback returns a fallback value in case of an interrupted path towards a key`, function () {
  const cToNumber = fallback(at(['a', 'b', 'c'], number), 42)

  const c1 = coerceTo(cToNumber, { a: 2 })
  const c2 = coerceTo(cToNumber, { a: { b: 3 } })
  const c3 = coerceTo(cToNumber, { a: { b: { d: 3 } } })

  assert.is(c1, 42)
  assert.is(c2, 42)
  assert.is(c3, 42)
})

test(`fallback does not intervene when the path exists`, function () {
  const cToNumber = fallback(at(['a', 'b', 'c'], number), 42)

  const c = coerceTo(cToNumber, { a: { b: { c: 3 } } })

  assert.is(c, 3)
})

test(`array accepts array of the indicated element type`, function () {
  const arrayOfStrings = arrayOf(string)

  const res = coerceTo(arrayOfStrings, ['a', 'b', 'c'])

  assert.equal(res, ['a', 'b', 'c'])
})

test('array rejects values that are not arrays', function () {
  const arrayOfStrings = arrayOf(string)

  const res = coerceTo(arrayOfStrings, 5)

  assert.equal(res, new InvalidCoercion('array', 5))
})

test('array rejects arrays of the wrong element type', function () {
  const arrayOfStrings = arrayOf(string)

  const res = coerceTo(arrayOfStrings, [1, 2, 3])

  assert.equal(res, new AtKey([0], new InvalidCoercion('string', 1)))
})

test('array reports nested errors', function () {
  const arrayOfStrings = arrayOf(at(['a'], string))

  const res = coerceTo(arrayOfStrings, [{ a: 5 }])

  assert.equal(res, new AtKey([0, 'a'], new InvalidCoercion('string', 5)))
})

test('array rejects a value upon the first missing element', function () {
  const arrayOfStrings = arrayOf(at(['a'], string))

  const res = coerceTo(arrayOfStrings, [{ b: 0 }, { b: 1 }, { b: 2 }])

  assert.equal(res, new MissingKey([0, 'a']))
})

test(`array propagates non fatal errors`, function () {
  const arrayOfPermissiveArray = arrayOf(permissiveArrayOf(number))

  const res = coerceTo(arrayOfPermissiveArray, [[1, 2, 3, 'hello']])

  assert.equal(res, [
    [[1, 2, 3]],
    [new AtKey([0, 3], new InvalidCoercion('number', 'hello'))],
  ])
})

test('permissive array accepts arrays with wrong element types', function () {
  const permissiveArrayOfStrings = permissiveArrayOf(string)

  const res = coerceTo(permissiveArrayOfStrings, ['a', 'b', 2])

  assert.equal(res, [
    ['a', 'b'],
    [new AtKey([2], new InvalidCoercion('string', 2))],
  ])
})

test('permissive array rejects values that are not arrays', function () {
  const permissiveArrayOfStrings = permissiveArrayOf(string)

  const res = coerceTo(permissiveArrayOfStrings, 5)

  assert.equal(res, new InvalidCoercion('array', 5))
})

test('permissive array propagates non-fatal errors', function () {
  const permissiveOfPermissive = permissiveArrayOf(permissiveArrayOf(number))

  const res3 = coerceTo(permissiveOfPermissive, [
    3,
    [1, 2, 3, 'hello'],
    [4, 5, 'world', 6],
  ])

  assert.equal(res3, [
    [
      [1, 2, 3],
      [4, 5, 6],
    ],
    [
      new AtKey([0], new InvalidCoercion('array', 3)),
      new AtKey([1, 3], new InvalidCoercion('number', 'hello')),
      new AtKey([2, 2], new InvalidCoercion('number', 'world')),
    ],
  ])
})

test(`combine accepts a function to mix-and-match other types`, function () {
  const id = combine(
    (a, b) => `${a}-${b}`,
    at(['a'], string),
    at(['b'], number)
  )

  const res = coerceTo(id, { a: 'hello', b: 12 })

  assert.is(res, 'hello-12')
})

test(`combine rejects the combination upon the first missing element`, function () {
  const id = combine(
    (a, b) => `${a}-${b}`,
    at(['a'], string),
    at(['b'], number)
  )

  const res = coerceTo(id, { b: 12 })

  assert.equal(res, new MissingKey(['a']))
})

test(`combine rejects the combination upon the first mismatching element`, function () {
  const id = combine(
    (a, b) => `${a}-${b}`,
    at(['a'], string),
    at(['b'], number)
  )

  const res = coerceTo(id, { a: 10, b: 12 })

  assert.equal(res, new AtKey(['a'], new InvalidCoercion('string', 10)))
})

test(`combine propagates non fatal errors`, function () {
  const add1 = (x: number) => x + 1
  const permissiveArrayPlus1 = combine(
    (xs) => xs.map(add1),
    permissiveArrayOf(number)
  )
  const res = coerceTo(permissiveArrayPlus1, [1, 2, 3, 'hello', true])

  assert.equal(res, [
    [2, 3, 4],
    [
      new AtKey([3], new InvalidCoercion('number', 'hello')),
      new AtKey([4], new InvalidCoercion('number', true)),
    ],
  ])
})

test.run()

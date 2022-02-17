import { test } from 'uvu'
import assert from 'uvu/assert'
import { coerceTo } from './Type'
import { number } from './number'
import { string } from './string'
import { always } from './always'
import { AtKey, InvalidCoercion } from './error/InvalidCoercion'
import { MissingKey } from './error/MissingKey'
import { Joint } from './error/Joint'
import { at } from './at'
import { permissiveArrayOf } from './permissiveArrayOf'

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

test(`permissive array does not include non-fatal errors if they are not possible`, function () {
  const arrayOf10s = permissiveArrayOf(always(10))

  const res = coerceTo(arrayOf10s, ['a', 'b', 'c'])

  assert.equal(res, [10, 10, 10])
})

test(`permissive array accepts alternatives as element type`, function () {
  const permissiveOfAlternatives = permissiveArrayOf(
    string.or(at(['a'], number))
  )

  const res1 = coerceTo(permissiveOfAlternatives, ['x', 'y', { a: 12 }])
  const res2 = coerceTo(permissiveOfAlternatives, ['x', 'y', { b: 'hello' }])

  assert.equal(res1, ['x', 'y', 12])
  assert.equal(res2, [
    ['x', 'y'],
    [
      new Joint([
        new AtKey([2], new InvalidCoercion('string', { b: 'hello' })),
        new MissingKey([2, 'a']),
      ]),
    ],
  ])
})

test.run()

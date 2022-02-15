import { test } from 'uvu'
import assert from 'uvu/assert'
import { number } from './number'
import { string } from './string'
import { coerceTo, Joint } from './Type'
import { InvalidCoercion } from './InvalidCoercion'
import { at, AtKey, MissingKey } from './collection'

test(`or allows specifying alternatives`, function () {
  const T = string.or(at(['b'], number))

  const res1 = coerceTo(T, 'hello')
  const res2 = coerceTo(T, { b: 15 })

  assert.is(res1, 'hello')
  assert.is(res2, 15)
})

test(`or rejects input values that are not coercible to any given alternative`, function () {
  const stringOrNumber = string.or(number)

  const res1 = coerceTo(stringOrNumber, true)
  const res2 = coerceTo(stringOrNumber, { a: 2 })

  assert.equal(
    res1,
    new Joint([
      new InvalidCoercion('string', true),
      new InvalidCoercion('number', true),
    ])
  )

  assert.equal(
    res2,
    new Joint([
      new InvalidCoercion('string', { a: 2 }),
      new InvalidCoercion('number', { a: 2 }),
    ])
  )
})

test(`or reports the path at which the error happened`, function () {

  const stringOrNumberAtA = string.or(at(['a'], number))

  const res1 = coerceTo(stringOrNumberAtA, { b: 12 })
  const res2 = coerceTo(stringOrNumberAtA, { a: 'hello' })

  assert.equal(
    res1,
    new Joint([
      new InvalidCoercion('string', { b: 12 }),
      new MissingKey(['a'])
    ])
  )

  assert.equal(
    res2,
    new Joint([
      new InvalidCoercion('string', { a: 'hello' }),
      new AtKey(['a'], new InvalidCoercion('number', 'hello'))
    ])
  )

})

test(`or reports multi-level missing keys`, function () {

  const T = at(['a'], string.or(at(['b'], number)))

  const res1 = coerceTo(T, { b: 12 })
  const res2 = coerceTo(T, { a: { c: 12 } })

  assert.equal(res1, new MissingKey(['a']))
  assert.equal(
    res2,
    new Joint([
      new AtKey(['a'], new InvalidCoercion('string', { c: 12 })),
      new MissingKey(['a', 'b'])
    ])
  )
})

test.run()
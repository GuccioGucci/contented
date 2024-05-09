import { test } from 'uvu'
import { is, equal } from 'uvu/assert'
import fc, { assert, property } from 'fast-check'
import { number } from './number'
import { isValid } from './isValid'
import { explain } from './explain'

test(`number accepts number values`, function () {
  assert(
    property(fcNumber, (value) => {
      const res = isValid(number, value)
      is(res, true)
    })
  )
})

test('number rejects all but number values', function () {
  assert(
    property(notANumber, (value) => {
      const res = isValid(number, value)
      is(res, false)
    })
  )
})

test(`there is an explanation why a value is not a number`, function () {
  assert(
    property(notANumber, (value) => {
      const exp = explain(number, value)
      equal(exp, {
        value,
        isNot: 'number',
      })
    })
  )
})

test(`there is no need for an explanation if the value is indeed a number`, function () {
  assert(
    property(fcNumber, (value) => {
      const exp = explain(number, value)
      is(exp, undefined)
    })
  )
})

test.run()

const fcSymbol = fc.string().map((str) => Symbol(str))
const fcNumber = fc.oneof(fc.integer(), fc.float(), fc.double()).filter((x) => !Number.isNaN(x))
const notANumber = fc.oneof(fc.string(), fc.bigInt(), fc.boolean(), fc.constant(null), fc.constant(undefined), fcSymbol)

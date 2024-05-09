import { test } from 'uvu'
import { is, equal } from 'uvu/assert'
import fc, { assert, property } from 'fast-check'
import { bigint } from './bigint'
import { isValid } from './isValid'
import { explain } from './explain'

test(`bigint accepts bigint values`, function () {
  assert(
    property(fc.bigInt(), (value) => {
      const res = isValid(bigint, value)
      is(res, true)
    })
  )
})

test(`bigint rejects all but bigint values`, function () {
  assert(
    property(notABigint, (value) => {
      const res = isValid(bigint, value)
      is(res, false)
    })
  )
})

test(`there is an explanation why a value is not a bigint`, function () {
  assert(
    property(notABigint, (value) => {
      const exp = explain(bigint, value)
      equal(exp, {
        value,
        isNot: 'bigint',
      })
    })
  )
})

test(`there is no need for an explanation if the value is indeed a bigint`, function () {
  assert(
    property(fc.bigInt(), (value) => {
      const exp = explain(bigint, value)
      is(exp, undefined)
    })
  )
})

test.run()

const fcSymbol = fc.string().map((str) => Symbol(str))
const fcNumber = fc.oneof(fc.integer(), fc.float(), fc.double())
const notABigint = fc.oneof(fcNumber, fc.string(), fc.boolean(), fc.constant(null), fc.constant(undefined), fcSymbol)

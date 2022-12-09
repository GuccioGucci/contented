import { test } from 'uvu'
import { is, equal } from 'uvu/assert'
import fc, { assert, property } from 'fast-check'
import { expectType } from 'ts-expect'
import { InvalidCoercion, coerceTo } from './coercion'
import { string } from './string'

test(`string accepts string values`, function () {
  assert(
    property(fc.string(), (value) => {
      const res = coerceTo(string, value)

      expectType<string | InvalidCoercion>(res)
      is(res, value)
    })
  )
})

test(`string rejects all but string values`, function () {
  assert(
    property(notAString, (value) => {
      const res = coerceTo(string, value)

      expectType<string | InvalidCoercion>(res)
      equal(res, new InvalidCoercion('string', value))
    })
  )
})

test.run()

const fcSymbol = fc.string().map((str) => Symbol(str))
const fcNumber = fc.oneof(fc.integer(), fc.float(), fc.double())
const notAString = fc.oneof(fcNumber, fc.boolean(), fc.constant(null), fc.constant(undefined), fcSymbol)

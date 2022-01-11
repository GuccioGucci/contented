import { test } from 'uvu'
import { equal } from 'uvu/assert'
import fc, { assert, property } from 'fast-check'
import { FieldIsNot, string } from './Field'
import { BooleanField, JsonField, LocationField, NumberField, StringField } from './arbitraries.test'

test('string accepts string fields', function () {
  assert(property(StringField, (field) =>
    equal(string.from(field), { value: field })
  ))
})

test('string rejects all but string fields', function () {
  const NotStringField = fc.oneof(NumberField, BooleanField, JsonField, LocationField)
  assert(property(NotStringField, (field) => (
    equal(string.from(field), { error: new FieldIsNot('string', field) })
  )))
})

test.run()
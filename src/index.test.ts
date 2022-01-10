import { test } from 'uvu'
import * as assert from 'uvu/assert'

import { jsonParse, jsonStringify } from '.'

test('JSON', function () {
  const input = {
    foo: 'hello',
    bar: 'world',
  }

  const output = jsonStringify(input)

  assert.equal(output, `{"foo":"hello","bar":"world"}`)
  assert.equal(jsonParse(output), input)
})

test.run()

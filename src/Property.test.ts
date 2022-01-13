import { test } from 'uvu'
import assert from 'uvu/assert'
import { number, string } from './As'
import { at, MissingKey } from './Property'

test(`a path leads to the value of an object's property`, function () {
  const pathToC = at(['a', 'b', 'c'], number)

  const c = pathToC.across({ a: { b: { c: 12 } } })

  assert.is(c, 12)
})

test(`a path supports navigating an array when numeric keys are used`, function () {
  const pathToLast = at([2], string)
  const pathToB = at(['a', 1, 'b'], number)

  const last = pathToLast.across(['b', 'c', 'd'])
  const b = pathToB.across({ a: [{ b: 1 }, { b: 2 }] })

  assert.is(last, 'd')
  assert.is(b, 2)
})

test(`a path to a non-existing property reports when the path got interrupted`, function () {
  const pathToC = at(['a', 'b', 'c'], number)

  const c1 = pathToC.across({ a: 2 })
  const c2 = pathToC.across({ a: { b: 3 } })
  const c3 = pathToC.across({ a: { b: { d: 3 } } })
  const c4 = pathToC.across({})

  assert.equal(c1, new MissingKey(['a', 'b']))
  assert.equal(c2, new MissingKey(['a', 'b', 'c']))
  assert.equal(c3, new MissingKey(['a', 'b', 'c']))
  assert.equal(c4, new MissingKey(['a']))
})

test(`when indicated, a path returns a fallback value in case of an interrupted path`, function () {
  const pathToC = at(['a', 'b', 'c'], number).orElse(42)

  const c1 = pathToC.across({ a: 2 })
  const c2 = pathToC.across({ a: { b: 3 } })
  const c3 = pathToC.across({ a: { b: { d: 3 } } })

  assert.is(c1, 42)
  assert.is(c2, 42)
  assert.is(c3, 42)
})

test.run()

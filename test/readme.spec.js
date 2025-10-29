// @ts-check
import assert from 'node:assert'
import { beforeEach, describe, it } from 'node:test'
import { createTestVars } from '../index.js'

const example = (/** @type {string | null} */ msg) => msg

describe('example()', () => {
  // declare "def" and "reset" functions in a top level test block (required)
  // (this will create state specific to this block)
  const { def, setup, subject } = createTestVars()
  const $foo = def('foo', () => /** @type {string | null} */ (null))
  const $bar = def('bar', () => $foo())
  const $subject = subject(async () => example(await $bar()))

  beforeEach(() => {
    // reset test variables before every test (required)
    setup()
  })

  describe('when there is a delay getting $bar', () => {
    beforeEach(() => {
      $bar.def(async () => {
        await new Promise((r) => setTimeout(r, 20))
        return $foo()
      })
    })

    describe("and $foo is set to 'foo'", () => {
      // can redefine variables in "beforeEach" blocks
      beforeEach(() => {
        $foo.def(() => 'foo')
      })

      it("returns 'foo'", async () => {
        assert.equal(await $subject(), 'foo')
      })
    })

    describe('and $foo is not set', () => {
      it('returns null', async () => {
        assert.equal(await $subject(), null)
      })
    })
  })
})

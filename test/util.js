// @ts-check
/**
 * @import {TestVar} from "../index.js"
 */
import assert from 'assert'
import { beforeEach, describe, it } from 'node:test'
import { TestVarsContext, TestVarsError } from '../index.js'

/**
 * @param {TestVarsContext} $
 * @param {TestVar<string | null>} $foo
 * @param {TestVar<string | null>} $bar
 */
function testBasicFunctionality($, $foo, $bar) {
  describe('basic functionality works', () => {
    describe('$foo', () => {
      it('throws an error when defining an existing variable', () => {
        assert.throws(() => {
          $.def('foo', () => 'blah')
        }, new TestVarsError('Duplicate initialization of "foo"'))
      })

      describe('when $foo is not set', () => {
        it('returns null', () => {
          assert.equal($foo(), null)
        })
      })

      describe("when $foo is set to 'bar'", () => {
        beforeEach(() => {
          $foo.def(() => 'bar')
        })

        it("returns 'bar'", () => {
          assert.equal($foo(), 'bar')
        })

        describe("and then changed to 'hello'", () => {
          beforeEach(() => {
            $foo.def(() => 'hello')
          })

          it("returns 'hello'", () => {
            assert.equal($foo(), 'hello')
          })
        })
      })
    })

    describe('$bar', () => {
      describe("when $foo is set to 'foo'", () => {
        // ensure we can't redefine it outside of a test block
        // (NB: a failure here will be reported differently than a typical test)
        assert.throws(
          () => {
            $foo.def(() => 'foo')
          },
          TestVarsError,
          'was unexpectedly able to redefine "foo" outside a "beforeEach" block'
        )

        beforeEach(() => {
          $foo.def(() => 'foo')
        })

        it("returns 'foo'", async () => {
          assert.equal(await $bar(), 'foo')
        })
      })

      describe('when $foo is not set', () => {
        it('returns null', async () => {
          assert.equal(await $bar(), null)
        })
      })
    })
  })
}

/**
 * tests are defined in this function so we can set up two separate test blocks
 * that run in parallel
 */
export function createTests() {
  describe('test-vars', () => {
    const $ = new TestVarsContext()
    const $foo = $.def('foo', () => /** @type {string | null} */ (null))
    const $bar = $.def('bar', async () => {
      await new Promise((r) => setTimeout(r, 50))
      return $foo()
    })

    describe('when setup is not called', () => {
      it('throws an error when redefining', () => {
        assert.throws(() => {
          $foo.def(() => 'blah')
        }, new TestVarsError('"setup()" must be called before redefining "foo"'))
      })

      it('throws an error when reading', () => {
        assert.throws(() => {
          $foo()
        }, new TestVarsError('"setup()" must be called before reading "foo"'))
      })
    })

    describe('when setup is called before each test', () => {
      beforeEach(() => {
        $.setup()
      })

      testBasicFunctionality($, $foo, $bar)

      describe('and teardown is called after each test', () => {
        testBasicFunctionality($, $foo, $bar)
      })

      describe('and teardown is called before each test', () => {
        beforeEach(() => {
          $.teardown()
        })

        it('throws an error when reading', () => {
          assert.throws(() => {
            $foo()
          }, new TestVarsError('"setup()" must be called before reading "foo"'))
        })
      })
    })
  })
}

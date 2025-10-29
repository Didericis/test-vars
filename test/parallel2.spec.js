// @ts-check
import { beforeEach, describe } from 'node:test'
import { createTests } from './util.js'
import assert from 'assert'
import os from 'os'

describe('parallel test 2', () => {
  beforeEach(() => {
    // make sure we're running tests on a machine capable of parallel tests
    assert.notEqual(
      os.availableParallelism(),
      1,
      'machine not capable of testing parallel execution'
    )
  })
  createTests()
})

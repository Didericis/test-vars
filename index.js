// @ts-check

/**
 * Function that defines the value of a TestVar
 * @template {any} T
 * @typedef {(() => T | Promise<T>)} TestVarGetter
 */

/**
 * TestVar instance returned by "def()"
 * @template {any} T
 * @typedef {TestVarGetter<T> & { def: (f: TestVarGetter<T>) => void}} TestVar
 */

export class TestVarsError extends Error {}

/**
 * Used to create TestVars for a given top level test block
 */
export class TestVarsContext {
  /** @type {boolean} */
  _ready
  /** @type {{ [name: string]: TestVarGetter<any> }} */
  _funcs
  /** @type {{ [name: string]: TestVarGetter<any> }} */
  _initialFuncs
  /** @type {{ [name: string]: any }} results */
  _results

  constructor() {
    this._ready = false
    this._funcs = {}
    this._initialFuncs = {}
    this._results = {}
  }

  /**
   * reset test block back to it's original state
   * (must be called in a `beforeEach` hook in a top level describe block)
   */
  setup() {
    this._funcs = { ...this._initialFuncs }
    this._results = {}
    this._ready = true
  }

  /**
   * optional teardown function to call after tests are completed that
   * clears state and explicitly declares it as not ready
   */
  teardown() {
    this._funcs = {}
    this._results = {}
    this._ready = false
  }

  /**
   * @template {any} T
   * @param {string} name name of the TestVar
   * @param {TestVarGetter<T>} f function that returns the TestVar value
   * @returns {TestVar<T>}
   */
  def(name, f) {
    if (name in this._initialFuncs)
      throw new TestVarsError(`Duplicate initialization of "${name}"`)
    this._initialFuncs[name] = () => f()
    const r = /** @type {TestVarGetter<T>} */ (
      () => {
        if (!this._ready)
          throw new TestVarsError(
            `"setup()" must be called before reading "${name}"`
          )
        if (!this._results[name]) this._results[name] = this._funcs[name]()
        return /** @type {T | Promise<T>} */ (this._results[name])
      }
    )
    return Object.assign(r, {
      /** @type {(f: TestVarGetter<T>) => void} */
      def: (f) => {
        if (name === 'subject') {
          throw new TestVarsError('Cannot redefine a test subject')
        }
        if (!this._ready)
          throw new TestVarsError(
            `"setup()" must be called before redefining "${name}"`
          )
        delete this._results[name]
        this._funcs[name] = () => f()
      }
    })
  }

  /**
   * @template {any} T
   * @param {TestVarGetter<T>} f function that returns the TestVar value
   * @returns {TestVar<T>}
   */
  subject(f) {
    return this.def('subject', f)
  }
}

/** @returns {Pick<TestVarsContext, 'def' | 'setup' | 'subject' | 'teardown'>} */
export function createTestVars() {
  const context = new TestVarsContext()

  return {
    def: (...args) => context.def(...args),
    setup: (...args) => context.setup(...args),
    subject: (...args) => context.subject(...args),
    teardown: (...args) => context.teardown(...args)
  }
}

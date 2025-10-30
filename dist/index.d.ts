/** @returns {Pick<TestVarsContext, 'def' | 'setup' | 'subject' | 'teardown'>} */
export function createTestVars(): Pick<TestVarsContext, "def" | "setup" | "subject" | "teardown">;
/**
 * Function that defines the value of a TestVar
 * @template {any} T
 * @typedef {() => T} TestVarGetter
 */
/**
 * TestVar instance returned by "def()"
 * @template {any} T
 * @typedef {TestVarGetter<T> & { def: (f: TestVarGetter<T>) => void}} TestVar
 */
export class TestVarsError extends Error {
}
/**
 * Used to create TestVars for a given top level test block
 */
export class TestVarsContext {
    /** @type {boolean} */
    _ready: boolean;
    /** @type {{ [name: string]: TestVarGetter<any> }} */
    _funcs: {
        [name: string]: TestVarGetter<any>;
    };
    /** @type {{ [name: string]: TestVarGetter<any> }} */
    _initialFuncs: {
        [name: string]: TestVarGetter<any>;
    };
    /** @type {{ [name: string]: any }} results */
    _results: {
        [name: string]: any;
    };
    /**
     * reset test block back to it's original state
     * (must be called in a `beforeEach` hook in a top level describe block)
     */
    setup(): void;
    /**
     * optional teardown function to call after tests are completed that
     * clears state and explicitly declares it as not ready
     */
    teardown(): void;
    /**
     * @template {any} T
     * @param {string} name name of the TestVar
     * @param {TestVarGetter<T>} f function that returns the TestVar value
     * @returns {TestVar<T>}
     */
    def<T extends unknown>(name: string, f: TestVarGetter<T>): TestVar<T>;
    /**
     * @template {any} T
     * @param {TestVarGetter<T>} f function that returns the TestVar value
     * @returns {TestVar<T>}
     */
    subject<T extends unknown>(f: TestVarGetter<T>): TestVar<T>;
}
/**
 * Function that defines the value of a TestVar
 */
export type TestVarGetter<T extends unknown> = () => T;
/**
 * TestVar instance returned by "def()"
 */
export type TestVar<T extends unknown> = TestVarGetter<T> & {
    def: (f: TestVarGetter<T>) => void;
};
//# sourceMappingURL=index.d.ts.map
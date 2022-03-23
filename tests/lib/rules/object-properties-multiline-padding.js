'use strict'

// ANCHOR Requirements
const ruleName = 'object-properties-multiline-padding'
const rule = require(`../../../lib/rules/${ruleName}`)
const {RuleTester} = require('eslint')

// ANCHOR Test cases
const valid = [
  // No empty lines around a single property.
  `const obj = {
    foo: 1,
  }`,
  `const obj = {
    foo() {return 1},
  }`,
  `const obj = {
    foo: () => 1,
  }`,
  `const obj = {
    foo() {
      return 1
    },
  }`,
  `const obj = {
    foo: {
      bar: 1,
    },
  }`,

  // No empty lines between single-line properties.
  `const obj = {
    foo: 1,
    bar() {return 1},
  }`,
  `const bar = 2

  const obj = {
    foo: () => 1,
    bar,
  }`,

  // Require empty line before a multi-line element
  `const obj = {
    foo: 1,

    bar() {
      return 1
    },
  }`,
  `const obj = {
    foo: {
      baz: 1,
    },

    bar() {
      return 1
    },
  }`,

  // Require empty line after a multi-line element
  `const obj = {
    foo: {
      baz: 1,
    },

    bar: 2,
  }`,
]

const invalid = [
  // No empty lines around a single property.
  {
    code: `const obj = {

      foo: 1,
    }`,

    errors: [{messageId: 'redundant-before', line: 3}],
  },
  {
    code: `const obj = {
      foo: 1,

    }`,

    errors: [{messageId: 'redundant-after', line: 2}],
  },
  {
    code: `const obj = {

      foo() {return 1},
    }`,

    errors: [{messageId: 'redundant-before', line: 3}],
  },
  {
    code: `const obj = {
      foo() {return 1},

    }`,

    errors: [{messageId: 'redundant-after', line: 2}],
  },
  {
    code: `const obj = {

      foo: () => 1,
    }`,

    errors: [{messageId: 'redundant-before', line: 3}],
  },
  {
    code: `const obj = {
      foo: () => 1,

    }`,

    errors: [{messageId: 'redundant-after', line: 2}],
  },
  {
    code: `const obj = {

      foo() {
        return 1
      },
    }`,

    errors: [{messageId: 'redundant-before', line: 3}],
  },
  {
    code: `const obj = {
      foo() {
        return 1
      },

    }`,

    errors: [{messageId: 'redundant-after', line: 2}],
  },
  {
    code: `const obj = {

      foo: {
        bar: 1,
      },
    }`,

    errors: [{messageId: 'redundant-before', line: 3}],
  },
  {
    code: `const obj = {
      foo: {
        bar: 1,
      },

    }`,

    errors: [{messageId: 'redundant-after', line: 2}],
  },

  // No empty lines between single-line properties.
  {
    code: `const obj = {
      foo: 1,

      bar() {return 1},
    }`,

    errors: [{messageId: 'redundant-after', line: 2}, {messageId: 'redundant-before', line: 4}],
  },
  {
    code: `const bar = 2
  
    const obj = {
      foo: () => 1,

      bar,
    }`,

    errors: [{messageId: 'redundant-after', line: 4}, {messageId: 'redundant-before', line: 6}],
  },

  // Require empty line before a multi-line element
  {
    code: `const obj = {
      foo: 1,
      bar() {
        return 1
      },
    }`,

    errors: [{messageId: 'require-before', line: 3}],
  },
  {
    code: `const obj = {
      foo: {
        baz: 1,
      },
      bar() {
        return 1
      },
    }`,

    errors: [{messageId: 'require-after', line: 2}, {messageId: 'require-before', line: 5}],
  },

  // Require empty line after a multi-line element
  {
    code: `const obj = {
      foo: {
        baz: 1,
      },
      bar: 2,
    }`,

    errors: [{messageId: 'require-after', line: 2}],
  },
]

// ANCHOR Tests
const ruleTester = new RuleTester({parserOptions: {ecmaVersion: 6}})
ruleTester.run(ruleName, rule, {valid, invalid})

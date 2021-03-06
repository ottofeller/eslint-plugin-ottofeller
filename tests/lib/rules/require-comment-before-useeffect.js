'use strict'

// ANCHOR Requirements
const ruleName = 'require-comment-before-useeffect'
const rule = require(`../../../lib/rules/${ruleName}`)
const {RuleTester} = require('eslint')

// ANCHOR Test cases
const valid = [
  `
  // This effect does nothing
  useEffect(() => undefined, [])
  `,
  `
  /* This effect does nothing */
  useEffect(() => undefined, [])
  `,
  `
  /**
   * This effect does nothing
   */
  useEffect(() => undefined, [])
  `,
  `
  // This effect does nothing
  React.useEffect(() => undefined, [])
  `,
  `
  /* This effect does nothing */
  React.useEffect(() => undefined, [])
  `,
  `
  /**
   * This effect does nothing
   */
  React.useEffect(() => undefined, [])
  `,
]

const invalid = [
  {
    code: 'useEffect(() => undefined, [])',
    errors: [{messageId: 'missingComment', line: 1}],
  },
  {
    code: `
      const num = 12
      useEffect(() => undefined, [])
    `,
    errors: [{messageId: 'missingComment', line: 3}],
  },
  {
    code: 'React.useEffect(() => undefined, [])',
    errors: [{messageId: 'missingComment', line: 1}],
  },
  {
    code: `
      const num = 12
      React.useEffect(() => undefined, [])
    `,
    errors: [{messageId: 'missingComment', line: 3}],
  },
]

// ANCHOR Tests
const ruleTester = new RuleTester({parserOptions: {ecmaVersion: 6}})
ruleTester.run(ruleName, rule, {valid, invalid})

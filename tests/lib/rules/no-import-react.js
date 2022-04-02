'use strict'

// ANCHOR Requirements
const ruleName = 'no-import-react'
const rule = require(`../../../lib/rules/${ruleName}`)
const {RuleTester} = require('eslint')

// ANCHOR Test cases
const valid = [
  'import {memo} from "react"',
  '',
]

const invalid = [
  {
    code: 'import React, {memo} from "react"',
    errors: [{messageId: 'noNamespaceImport', line: 1}],
  },
  {
    code: 'import Reactor, {memo} from "react"',
    errors: [{messageId: 'noNamespaceImport', line: 1}],
  },
  {
    code: 'import * as React from "react"',
    errors: [{messageId: 'noNamespaceImport', line: 1}],
  },
]

// ANCHOR Tests
const ruleTester = new RuleTester({parserOptions: {ecmaVersion: 6, sourceType: "module"}})
ruleTester.run(ruleName, rule, {valid, invalid})

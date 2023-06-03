const ruleName = 'ts-as-expression'
const rule = require(`../../../lib/rules/${ruleName}`)
const {RuleTester} = require('eslint')
const path = require('path')

const valid = [
  `
import {TSESTree} from '@typescript-eslint/utils'
declare const member: TSESTree.TSEnumMember
if (
  member.id.type === AST_NODE_TYPES.Literal &&
  typeof member.id.value === 'string'
) {
  const name = member.id
}`,
  'const foo = 3',
  `
const a = [1, 2]
const b = [3, 4]
const c = [...a, ...b] as const`,
  'const a = [1, 2] as const',
  "const a = 'a' as const",
  "const a = {foo: 'foo'} as const",
  `
const a = [1, 2]
const b = [3, 4]
const c = <const>[...a, ...b]`,
  'const a = <const>[1, 2]',
  "const a = <const>'a'",
  "const a = <const>{foo: 'foo'}",
]

const invalid = [
  {
    code: 'const foo = (3 + 5) as number',
    errors: [{messageId: 'noTypeAssertions', line: 1, column: 13}],
  },
  {
    code: 'const foo = 3 as number',
    errors: [{messageId: 'noTypeAssertions', line: 1, column: 13}],
  },
  {
    code: 'const foo = <number>3',
    errors: [{messageId: 'noTypeAssertions', line: 1, column: 13}],
  },
  {
    code: 'const foo = <3>3',
    errors: [{messageId: 'noTypeAssertions', line: 1, column: 13}],
  },
  {
    code: 'const foo = 3 as 3;',
    errors: [{messageId: 'noTypeAssertions', line: 1, column: 13}],
  },
  {
    code: 'const foo = <number>(3 + 5)',
    errors: [{messageId: 'noTypeAssertions', line: 1, column: 13}],
  },
  {
    code: "const value = 'test' as string | null | undefined",
    errors: [{messageId: 'noTypeAssertions', line: 1, column: 15}],
  },
  {
    code: 'const foo = (3 + 5) as any',
    errors: [{messageId: 'noTypeAssertions', line: 1, column: 13}],
  },
  {
    code: "(Syntax as any).ArrayExpression = 'foo'",
    errors: [{messageId: 'noTypeAssertions', line: 1, column: 2}],
  },
  {
    code: `
type Foo = number
const foo = (3 + 5) as Foo`,
    errors: [{messageId: 'noTypeAssertions', line: 3, column: 13}],
  },
  {
    code: `
type Foo = number
const foo = <Foo>(3 + 5)`,
    errors: [{messageId: 'noTypeAssertions', line: 3, column: 13}],
  },
  {
    code: `
declare const foo: Foo
const bar = <Foo>foo`,
    errors: [{messageId: 'noTypeAssertions', line: 3, column: 13}],
  },
  {
    code: `
type Tuple = [3, 'hi', 'bye']
const foo = [3, 'hi', 'bye'] as Tuple`,
    errors: [{messageId: 'noTypeAssertions', line: 3, column: 13}],
  },
  {
    code: `
type PossibleTuple = {hello: 'hello'}
const foo = {hello: 'hello'} as PossibleTuple`,
    errors: [{messageId: 'noTypeAssertions', line: 3, column: 13}],
  },
  {
    code: `
type PossibleTuple = {0: 'hello', 5: 'hello'}
const foo = {0: 'hello', 5: 'hello'} as PossibleTuple`,
    errors: [{messageId: 'noTypeAssertions', line: 3, column: 13}],
  },
  {
    code:`
import { TSESTree } from '@typescript-eslint/utils'
declare const member: TSESTree.TSEnumMember
const name = member.id as TSESTree.StringLiteral`,
    errors: [{messageId: 'noTypeAssertions', line: 4, column: 14}],
  }
]

const ruleTester = new RuleTester({
  parser: require.resolve('@typescript-eslint/parser'),

  parserOptions: {
    sourceType: 'module',
    tsconfigRootDir: path.resolve(__dirname, '../utils'),
    project: './tsconfig.json',
  },
})

ruleTester.run(ruleName, rule, {valid, invalid})

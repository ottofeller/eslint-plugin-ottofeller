'use strict'

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require('../../../lib/rules/jsx-newline-block')
const {RuleTester } = require('eslint')

//------------------------------------------------------------------------------
// Test cases
//------------------------------------------------------------------------------

const validJSXElements = [
  // No empty lines around single line elements and text.
  `
  <App>
    <div>Some Text</div>
  </App>
  `,
  `
  <App>
    <div>Some Text</div>
    <div>Some Text</div>
  </App>
  `,
  `
  <App>
    Some Text
    <div>Some Text</div>
  </App>
  `,
  `
  <App>
    <div>Some Text</div>
    Some Text
  </App>
  `,
  // No empty lines around a single multiline element.
  `
  <App>
    <div>
      Some Text
    </div>
  </App>
  `,
  // Require an empty line before and after a multiline element, if other non-empty children exist.
  `
  <App>
    <div>
      Some Text
    </div>

    <div>
      Some Text
    </div>
  </App>
  `,
  `
  <App>
    <div>Some Text</div>

    <div>
      Some Text
    </div>
  </App>
  `,
  `
  <App>    
    <div>
      Some Text
    </div>

    <div>Some Text</div>
  </App>
  `,
  `
  <App>
    Some Text

    <div>
      Some Text
    </div>
  </App>
  `,
  `
  <App>    
    <div>
      Some Text
    </div>

    Some Text
  </App>
  `,
  `
  <App>
    <div>Some Text</div>
    Some Text

    <div>
      Some Text
    </div>
  </App>
  `,
  `
  <App>    
    <div>
      Some Text
    </div>

    Some Text
    <div>Some Text</div>
  </App>
  `,
]

const invalidJSXElements = [
  // No empty lines around single line elements and text.
  {
    code: `
      <App>
      
        <div>Some Text</div>
      </App>
      `,

    errors: [{messageId: 'redundant', line: 2}],
  },
  {
    code: `
      <App>
        <div>Some Text</div>
      
      </App>
      `,

    errors: [{messageId: 'redundant', line: 3}],
  },
  {
    code: `
      <App>

        Some Text
        <div>Some Text</div>
      </App>
      `,

    errors: [{messageId: 'redundant', line: 2}],
  },
  {
    code: `
      <App>
        Some Text

        <div>Some Text</div>
      </App>
      `,

    errors: [{messageId: 'redundant', line: 2}],
  },
  {
    code: `
      <App>
        <div>Some Text</div>

        Some Text
      </App>
      `,

    errors: [{messageId: 'redundant', line: 3}],
  },
  {
    code: `
      <App>
        <div>Some Text</div>
        Some Text

      </App>
      `,

    errors: [{messageId: 'redundant', line: 3}],
  },
  {
    code: `
      <App>
        <div>Some Text</div>

        <div>Some Text</div>
      </App>
      `,

    errors: [{messageId: 'redundant', line: 3}],
  },
  {
    code: `
      <App>
        <div>

          Some Text
        </div>
      </App>
      `,

    errors: [{messageId: 'redundant', line: 3}],
  },
  {
    code: `
      <App>
        <div>
          Some Text

        </div>
      </App>
      `,

    errors: [{messageId: 'redundant', line: 3}],
  },
  // No empty lines around an only multiline element.
  {
    code: `
      <App>
 
        <div>
          Some Text
        </div>
      </App>
      `,

    errors: [{messageId: 'redundant', line: 2}],
  },
  {
    code: `
      <App>
        <div>
          Some Text
        </div>
      
      </App>
      `,

    errors: [{messageId: 'redundant', line: 5}],
  },
  // Text shall be separated by an empty line from a multiline element,
  // but not have redundant empty line on the other side.
  {
    code: `
      <App>
        Some Text
        <div>
          Some Text
        </div>
      </App>
      `,

    errors: [{messageId: 'require', line: 2}],
  },
  {
    code: `
      <App>
 
        Some Text

        <div>
          Some Text
        </div>
      </App>
      `,

    errors: [{messageId: 'redundant', line: 2}],
  },
  {
    code: `
      <App>

        Some Text
        <div>
          Some Text
        </div>
      </App>
      `,

    errors: [{messageId: 'redundant', line: 2}],
  },
  {
    code: `
      <App>
        <div>
          Some Text
        </div>
        Some Text
      </App>
      `,

    errors: [{messageId: 'require', line: 5}],
  },
  {
    code: `
      <App>
        <div>
          Some Text
        </div>
 
        Some Text

      </App>
      `,

    errors: [{messageId: 'redundant', line: 5}],
  },
  {
    code: `
      <App>
        <div>
          Some Text
        </div>
        Some Text

      </App>
      `,

    errors: [{messageId: 'redundant', line: 5}],
  },
  // Require an empty line before and after a multiline element if an adjacent element exists.
  {
    code: `
      <App>
        <div>Some Text</div>
        <div>
          Some Text
        </div>
      </App>
      `,

    errors: [{messageId: 'require', line: 4}],
  },
  {
    code: `
      <App>
        <div>
          Some Text
        </div>
        <div>Some Text</div>
      </App>
      `,

    errors: [{messageId: 'require', line: 3}],
  },
  // Text elements shall not interfere with the rule logic.
  {
    code: `
      <App>
        <div>Some Text</div>
        Some Text
        <div>
          Some Text
        </div>
      </App>
      `,

    errors: [{messageId: 'require', line: 5}],
  },
  {
    code: `
      <App>
        <div>Some Text</div>

        Some Text
        <div>
          Some Text
        </div>
      </App>
      `,

    errors: [{messageId: 'redundant', line: 3}],
  },
  {
    code: `
      <App>
        <div>Some Text</div>

        Some Text

        <div>
          Some Text
        </div>
      </App>
      `,

    errors: [{messageId: 'redundant', line: 3}],
  },
  {
    code: `
      <App>
        <div>
          Some Text
        </div>
        Some Text
        <div>Some Text</div>
      </App>
      `,

    errors: [{messageId: 'require', line: 3}],
  },
  {
    code: `
      <App>
        <div>
          Some Text
        </div>
        Some Text

        <div>Some Text</div>
      </App>
      `,

    errors: [{messageId: 'redundant', line: 8}],
  },
  {
    code: `
      <App>
        <div>
          Some Text
        </div>

        Some Text

        <div>Some Text</div>
      </App>
      `,

    errors: [{messageId: 'redundant', line: 9}],
  },
  {
    code: `
      <App>
        <div>
          Some Text
        </div>
        <div>
          Some Text
        </div>
      </App>
      `,

    errors: [{messageId: 'require', line: 5}],
  },
  {
    code: `
      <App>
        <div>
          Some Text
        </div>
        Some Text
        <div>
          Some Text
        </div>
      </App>
      `,

    errors: [{messageId: 'require', line: 3}, {messageId: 'require', line: 7}],
  },
  {
    code: `
      <App>
        <div>
          Some Text
        </div>

        Some Text
        <div>
          Some Text
        </div>
      </App>
      `,

    errors: [{messageId: 'require', line: 8}],
  },
  {
    code: `
      <App>
        <div>
          Some Text
        </div>
        Some Text

        <div>
          Some Text
        </div>
      </App>
      `,

    errors: [{messageId: 'require', line: 3}],
  },
]

const validJSXFragments = validJSXElements.map(
  code => code.replaceAll('App>', '>')
)

const validJSXExpressionContainer = validJSXElements.map(
  code => code.replaceAll('<div>Some Text</div>', `{'Some Text'}`)
)

const invalidJSXFragments = invalidJSXElements.map(element => {
  element.code = element.code.replaceAll('App>', '>')
  return element
})

const invalidJSXExpressionContainer = invalidJSXElements.map(element => {
  element.code = element.code.replaceAll(
    '<div>Some Text</div>',
    `{'Some Text'}`,
  )

  return element
})

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  parserOptions: {ecmaVersion: 6, ecmaFeatures: {jsx: true}}
})

ruleTester.run('jsx-newline-block', rule, {
  valid: [
    ...validJSXElements,
    ...validJSXFragments,
    ...validJSXExpressionContainer
  ],

  invalid: [
    ...invalidJSXElements,
    ...invalidJSXFragments,
    ...invalidJSXExpressionContainer
  ],
})
'use strict'

// ANCHOR Requirements
const ruleName = 'jsx-newline-block'
const rule = require(`../../../lib/rules/${ruleName}`)
const {RuleTester} = require('eslint')

// ANCHOR Test cases
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

    errors: [{messageId: 'redundant', line: 2}, {messageId: 'require', line: 2}],
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

    errors: [{messageId: 'redundant', line: 5}, {messageId: 'require', line: 5}],
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

    errors: [{messageId: 'require', line: 3}],
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

    errors: [{messageId: 'require', line: 5}],
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

    errors: [{messageId: 'require', line: 3}],
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

    errors: [{messageId: 'require', line: 5}],
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

    errors: [{messageId: 'redundant', line: 5}],
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

    errors: [{messageId: 'redundant', line: 5}],
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

    errors: [{messageId: 'require', line: 5}, {messageId: 'require', line: 5}],
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

    errors: [{messageId: 'require', line: 5}],
  },
]

const validJSXFragments = validJSXElements.map(
  code => code.replace(/App>/g, '>')
)

const validJSXExpressionContainer = validJSXElements.map(
  code => code.replace(/<div>Some Text<\/div>/g, `{'Some Text'}`)
)

const invalidJSXFragments = invalidJSXElements.map(element => {
  const newElement = Object.assign({}, element)
  newElement.code = newElement.code.replace(/App>/g, '>')
  return newElement
})

const invalidJSXExpressionContainer = invalidJSXElements.map(element => {
  const newElement = Object.assign({}, element)

  newElement.code = newElement.code.replace(
    /<div>Some Text<\/div>/g,
    `{'Some Text'}`,
  )

  return newElement
})

// ANCHOR Tests
const ruleTester = new RuleTester({
  parserOptions: {ecmaVersion: 6, ecmaFeatures: {jsx: true}}
})

ruleTester.run(ruleName, rule, {
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

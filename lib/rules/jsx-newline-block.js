const isEmptyLine = value => /\n\s*\n/.test(value)

module.exports = {
  meta: {
    fixable: null,

    messages: {
      redundant: 'Redundant empty line',
      require  : 'Require empty line',
    },
  },

  create(context) {
    const jsxElementParents = new Set()

    return {
      ':matches(JSXElement, JSXFragment) > :matches(JSXElement, JSXExpressionContainer)': node => {
        jsxElementParents.add(node.parent);
      },

      'Program:exit'() {
        jsxElementParents.forEach(parent => {
          parent.children.forEach((element, index, elements) => {
            // first in ReturnStatement
            if(index === 0 && isEmptyLine(element.value)) {
              context.report({
                node     : element,
                messageId: 'redundant',
              })
            }

            // last in ReturnStatement
            if(index === elements.length - 1 && elements.length > 1 && isEmptyLine(element.value)) {
              context.report({
                node     : element,
                messageId: 'redundant',
              })
            }

            if(['JSXElement', 'JSXExpressionContainer', 'JSXText'].includes(element.type)) {
              return
            }
          })
        })
      },
    }
  },
}

const isEmptyLine = element => {
  return element && element.type === 'JSXText' && /\n\s*\n/.test(element.value)
}

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

            // JSXText here is the line breaks only
            if(['JSXElement', 'JSXExpressionContainer', 'JSXText'].includes(element.type)) {
              const hasChildren = element.type === 'JSXText' ? false : Boolean(element.children.length)
              const prev = elements[index - 1]
              const next = elements[index + 1]
              const secondNext = elements[index + 2]

              if(!prev || !next) {
                if(!prev && isEmptyLine(element)) {
                  context.report({messageId: 'redundant', node: element})
                }

                if(!next && isEmptyLine(element)) {
                  context.report({messageId: 'redundant', node: element})
                }
              }else{
                if(!hasChildren && !isEmptyLine(element) && secondNext && isEmptyLine(next)) {
                  if(!(secondNext.children && secondNext.children.length)) {
                    context.report({messageId: 'redundant', node: element})
                  }
                }

                if(!hasChildren && !isEmptyLine(element) && next) {
                  if(next.children && next.children.length) {
                    context.report({messageId: 'require', node: next})
                  }
                }

                if(hasChildren && !isEmptyLine(next) && secondNext) {
                  context.report({messageId: 'require', node: next})
                }
              }
            }
          })
        })
      },
    }
  },
}

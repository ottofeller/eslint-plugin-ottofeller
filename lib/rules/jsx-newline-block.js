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
              const prev = elements[index - 1]
              const next = elements[index + 1]

              if(!prev || !next) {
                if(!prev && isEmptyLine(element)) {
                  context.report({messageId: 'redundant', node: element})
                }

                if(!next && isEmptyLine(element)) {
                  context.report({messageId: 'redundant', node: element})
                }
              }else{
                if(element.type === 'JSXText') {
                  return
                }

                const secondNext = elements[index + 2]

                if(!secondNext) {
                  return
                }

                const isMultiline = Boolean(element.loc.end.line - element.loc.start.line)
                const isSecondMultiline = Boolean(secondNext.loc.end.line - secondNext.loc.start.line)

                if(!isMultiline && isEmptyLine(next) && !isSecondMultiline) {
                  context.report({messageId: 'redundant', node: element})
                }

                if(isMultiline && !isEmptyLine(next) && isSecondMultiline) {
                  context.report({messageId: 'require', node: element})
                }

                if((!isMultiline && isSecondMultiline) || (isMultiline && !isSecondMultiline)) {
                  if(!isEmptyLine(next)) {
                    context.report({messageId: 'require', node: element})
                  }
                }
              }
            }
          })
        })
      },
    }
  },
}

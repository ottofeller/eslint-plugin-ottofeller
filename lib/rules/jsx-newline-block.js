const isTextElement = element => element && element.type === 'JSXText'
const isEmptyLine = element => isTextElement(element) && /\n\s*\n/.test(element.value)
const containsText = element => isTextElement(element) && /\S+/.test(element.value)
const emptyLineBeforeText = element => 
  isTextElement(element) && /\n\s*\n\s*\S+/.test(element.value)
const emptyLineAfterText = element => 
  isTextElement(element) && /\S+\n\s*\n/.test(element.value)
const isMultiline = element => Boolean(element.loc.end.line - element.loc.start.line)

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

    /**
     * Check for an empty line and report error if not found.
     * @param {ASTNode} node node to check and attach report to
     * @returns {void}
     */
    function requireEmptyLine(node) {
      if(!isEmptyLine(node)) {
        context.report({messageId: 'require', node})
      }
    }
    
    /**
     * Check for an empty line and report error if found.
     * @param {ASTNode} node node to check and attach report to
     * @returns {void}
     */
    function requireNoEmptyLine(node) {
      if(isEmptyLine(node)) {
        context.report({messageId: 'redundant', node})
      }
    }

    /**
     * Check for an empty line before text and report error if not found.
     * @param {ASTNode} node node to check and attach report to
     * @returns {void}
     */
    function requireEmptyLineBeforeText(node) {
      if(!emptyLineBeforeText(node)) {
        context.report({messageId: 'require', node})
      }
    }
    
    /**
     * Check for an empty line before text and report error if found.
     * @param {ASTNode} node node to check and attach report to
     * @returns {void}
     */
    function requireNoEmptyLineBeforeText(node) {
      if(emptyLineBeforeText(node)) {
        context.report({messageId: 'redundant', node})
      }
    }
    
    /**
     * Check for an empty line after text and report error if not found.
     * @param {ASTNode} node node to check and attach report to
     * @returns {void}
     */
    function requireEmptyLineAfterText(node) {
      if(!emptyLineAfterText(node)) {
        context.report({messageId: 'require', node})
      }
    }
    
    /**
     * Check for an empty line after text and report error if found.
     * @param {ASTNode} node node to check and attach report to
     * @returns {void}
     */
    function requireNoEmptyLineAfterText(node) {
      if(emptyLineAfterText(node)) {
        context.report({messageId: 'redundant', node})
      }
    }

    return {
      ':matches(JSXElement, JSXFragment) > JSXText': node => {
        // JSXText as an only child
        if(node.parent.children.length === 1 && isEmptyLine(node)) {
          context.report({messageId: 'redundant', node})
        }
      },

      ':matches(JSXElement, JSXFragment) > :matches(JSXElement, JSXExpressionContainer)': node => {
        jsxElementParents.add(node.parent);
      },

      'Program:exit'() {
        const elementTypesToCheck = ['JSXElement', 'JSXExpressionContainer', 'JSXText']

        jsxElementParents.forEach(parent => {
          parent.children.forEach((element, index, elements) => {
            if(!elementTypesToCheck.includes(element.type)) {
              return
            }
            
            const prev = elements[index - 1]
            const next = elements[index + 1]
            const secondNext = elements[index + 2]

            // JSXText as first child
            if(!prev && isTextElement(element)) {
              /**
               * 1. <>
               *      Text
               *      _
               *    </>
               * 2. <>
               *      _
               *      Text
               *    </>
               * 3. <>
               *      Text
               *      _
               *      <single line tag>
               *    </>
               * 4. <>
               *      _
               *      Text
               *      <single line tag>
               *    </>
               * 5. <>
               *      _
               *      <single line tag>
               *    </>
               */
              if(!next || !isMultiline(next)) {
                requireNoEmptyLine(element)
                return
              } // else if(next && isMultiline(next))

              /**
               * <>
               *   _
               *   <multi line tag>
               * </>
               */
              if(!containsText(element)) {
                requireNoEmptyLine(element)
                return
              } // else if(containsText(element))

              /**
               * <>
               *   _
               *   Text
               *   <multi line tag>
               * </>
               */
              requireNoEmptyLineBeforeText(element)

              /**
               * <>
               *   Text
               *   <multi line tag>
               * </>
               */
              requireEmptyLineAfterText(element)

              return
            }

            // JSXText as last child
            if(!next && isTextElement(element)) {
              /**
               * 1. <>
               *      <single line tag>
               *      _
               *      Text
               *    </>
               * 2. <>
               *      <single line tag>
               *      Text
               *      _
               *    </>
               * 3. <>
               *      <single line tag>
               *      _
               *    </>
               */
              if(!prev || !isMultiline(prev)) {
                requireNoEmptyLine(element)
                return
              } // else if(prev && isMultiline(prev))
            
              /**
               * <>
               *   <multi line tag>
               *   _
               * </>
               */
              if(!containsText(element)) {
                requireNoEmptyLine(element)
                return
              } // else if(containsText(element))

              /**
               * <>
               *   <multi line tag>
               *   Text
               *   _
               * </>
               */
              requireNoEmptyLineAfterText(element)
              
              /**
               * <>
               *   <multi line tag>
               *   Text
               * </>
               */
              requireEmptyLineBeforeText(element)

              return
            }

            // A JSXElement or JSXExpressionContainer as not an only non-text child
            if(prev && next && secondNext && element.type !== 'JSXText') {
              const isMultilineElement = isMultiline(element)
              const isSecondMultiline = isMultiline(secondNext)

              /**
               * 1. <>
               *      <single line tag>
               *      _
               *      <single line tag>
               *    </>
               * 2. <>
               *      <single line tag>
               *      Text
               *      _
               *      <single line tag>
               *    </>
               * 3. <>
               *      <single line tag>
               *      _
               *      Text
               *      <single line tag>
               *    </>
               */
              if(!isMultilineElement && !isSecondMultiline) {
                requireNoEmptyLine(next)
                return
              } // else if(isMultilineElement || isSecondMultiline)

              /**
               * <>
               *   <multi line tag>
               *   <multi line tag>
               * </>
               */
              if(isMultilineElement && isSecondMultiline && !containsText(next)) {
                requireEmptyLine(next)
                return
              }

              if(isMultilineElement && isSecondMultiline && containsText(next)) {
                /**
                 * <>
                 *   <multi line tag>
                 *   Text
                 *   _
                 *   <multi line tag>
                 * </>
                 */
                requireEmptyLineBeforeText(next)

                /**
                 * <>
                 *   <multi line tag>
                 *   _
                 *   Text
                 *   <multi line tag>
                 * </>
                 */
                requireEmptyLineAfterText(next)

                return
              }

              // else if((!isMultilineElement && isSecondMultiline) || (isMultilineElement && !isSecondMultiline))

              /**
               * 1. <>
               *      <single line tag>
               *      <multi line tag>
               *    </>
               * 2. <>
               *      <single line tag>
               *      Text
               *      <multi line tag>
               *    </>
               * 3. <>
               *      <multi line tag>
               *      <single line tag>
               *    </>
               * 4. <>
               *      <multi line tag>
               *      Text
               *      <single line tag>
               *    </>
               */
              requireEmptyLine(next)

              /**
               * <>
               *   <single line tag>
               *   _
               *   Text
               *   _
               *   <multi line tag>
               * </>
               */
              if(!isMultilineElement) {
                requireNoEmptyLineBeforeText(next)
              }

              /**
               * <>
               *   <multi line tag>
               *   _
               *   Text
               *   _
               *   <single line tag>
               * </>
               */
              if(!isSecondMultiline) {
                requireNoEmptyLineAfterText(next)
              }
            }
          })
        })
      },
    }
  },
}

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
        jsxElementParents.forEach(parent => {
          parent.children.forEach((element, index, elements) => {

            if(['JSXElement', 'JSXExpressionContainer', 'JSXText'].includes(element.type)) {
              const prev = elements[index - 1]
              const next = elements[index + 1]

              if(!prev || !next) {
                // JSXText as first child
                if(!prev && isTextElement(element)) {
                  if(next && isMultiline(next)) {
                    if(isEmptyLine(element)) {
                      /**
                       * <>
                       *   _
                       *   <multi line tag>
                       * </>
                       */
                      if(!containsText(element)) {
                        context.report({messageId: 'redundant', node: element})
                      }

                      /**
                       * <>
                       *   _
                       *   Text
                       *   <multi line tag>
                       * </>
                       */
                      if(emptyLineBeforeText(element)) {
                        context.report({messageId: 'redundant', node: element})
                      }
                    }else if(containsText(element)){
                      /**
                       * <>
                       *   Text
                       *   <multi line tag>
                       * </>
                       */
                      context.report({messageId: 'require', node: element})
                    }
                  }else{
                    /**
                     * 1. <>
                     *      Text
                     *      _
                     *      <single line tag>
                     *    </>
                     * 2. <>
                     *      _
                     *      Text
                     *      <single line tag>
                     *    </>
                     * 3. <>
                     *      _
                     *      <single line tag>
                     *    </>
                     */
                    if(isEmptyLine(element)) {
                      context.report({messageId: 'redundant', node: element})
                    }
                  }
                }

                // JSXText as last child
                if(!next && isTextElement(element)) {
                  if(prev && isMultiline(prev)) {
                    if(isEmptyLine(element)) {
                      /**
                       * <>
                       *   <multi line tag>
                       *   _
                       * </>
                       */
                      if(!containsText(element)) {
                        context.report({messageId: 'redundant', node: element})
                      }

                      /**
                       * <>
                       *   <multi line tag>
                       *   Text
                       *   _
                       * </>
                       */
                      if(emptyLineAfterText(element)) {
                        context.report({messageId: 'redundant', node: element})
                      }
                    }else if(containsText(element)){
                      /**
                       * <>
                       *   <multi line tag>
                       *   Text
                       * </>
                       */
                      context.report({messageId: 'require', node: element})
                    }
                  }else{
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
                    if(isEmptyLine(element)) {
                      context.report({messageId: 'redundant', node: element})
                    }
                  }
                }
              }else{
                if(element.type === 'JSXText') {
                  return
                }

                const secondNext = elements[index + 2]

                if(!secondNext) {
                  return
                }

                const isMultilineElement = isMultiline(element)
                const isSecondMultiline = isMultiline(secondNext)

                /**
                 * <>
                 *   <single line tag>
                 *   _
                 *   <single line tag>
                 * </>
                 */
                if(!isMultilineElement && isEmptyLine(next) && !isSecondMultiline) {
                  context.report({messageId: 'redundant', node: next})
                }

                if(isMultilineElement && isSecondMultiline) {
                  if(containsText(next)) {
                    /**
                     * <>
                     *   <multi line tag>
                     *   Text
                     *   _
                     *   <multi line tag>
                     * </>
                     */
                    if(!emptyLineBeforeText(next)) {
                      context.report({messageId: 'require', node: element})
                    }

                    /**
                     * <>
                     *   <multi line tag>
                     *   _
                     *   Text
                     *   <multi line tag>
                     * </>
                     */
                    if(!emptyLineAfterText(next)) {
                      context.report({messageId: 'require', node: secondNext})
                    }
                  }else{
                    /**
                     * <>
                     *   <multi line tag>
                     *   <multi line tag>
                     * </>
                     */
                    if(!isEmptyLine(next)) {
                      context.report({messageId: 'require', node: next})
                    }
                  }
                }

                if(!isMultilineElement && isSecondMultiline) {
                  /**
                   * 1. <>
                   *     <single line tag>
                   *     <multi line tag>
                   *    </>
                   * 2. <>
                   *     <single line tag>
                   *     Text
                   *     <multi line tag>
                   *    </>
                   */
                  if(!isEmptyLine(next)) {
                    context.report({messageId: 'require', node: secondNext})
                  }

                  /**
                   * <>
                   *   <single line tag>
                   *   _
                   *   Text
                   *   _
                   *   <multi line tag>
                   * </>
                   */
                  if(emptyLineBeforeText(next)) {
                    context.report({messageId: 'redundant', node: element})
                  }
                }

                if(isMultilineElement && !isSecondMultiline) {
                  /**
                   * 1. <>
                   *     <multi line tag>
                   *     <single line tag>
                   *   </>
                   * 2. <>
                   *     <multi line tag>
                   *     Text
                   *     <single line tag>
                   *   </>
                   */
                  if(!isEmptyLine(next)) {
                    context.report({messageId: 'require', node: element})
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
                  if(emptyLineAfterText(next)) {
                    context.report({messageId: 'redundant', node: secondNext})
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

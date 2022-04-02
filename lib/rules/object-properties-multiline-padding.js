/**
 * @fileoverview Rule to check for correct empty line placing in object expressions.
 * @author Ottofeller
 */
"use strict";
 
/**
 * @param {import('estree').Node} element 
 * @returns {boolean}
 */
const isMultiline = element => Boolean(element.loc.end.line - element.loc.start.line)
const isEmptyLine = (/** @type {Number} */ distance) => distance > 1

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    fixable: 'whitespace',

    messages: {
      'redundant-after' : 'Redundant empty line after an object property',
      'redundant-before': 'Redundant empty line before an object property',
      'require-after'   : 'Require empty line after an object property',
    },

    type: 'layout',
  },

  create(context) {
    const sourceCode = context.getSourceCode()

    /**
     * @param {import('eslint').AST.Range} range 
     * @param {boolean} insert 
     * @returns {import('eslint').Rule.ReportFixer}
     */
    function getFixer(range, insert = false) {
      return function fix(fixer) {
        const codeForGivenRange = sourceCode.text.slice(...range)
        const firstNewlineChar = codeForGivenRange.indexOf('\n')

        if (firstNewlineChar === -1) {
          return
        }

        const rangeCodeBeforeFirstNewline = codeForGivenRange.slice(0, firstNewlineChar + 1)

        if (insert) {
          return fixer.replaceTextRange(
            range,
            rangeCodeBeforeFirstNewline + '\n' + codeForGivenRange.slice(firstNewlineChar + 1),
          )
        }

        const rangeCodeAfterFirstNewline = codeForGivenRange.slice(firstNewlineChar + 1)
        const secondNewlineChar = rangeCodeAfterFirstNewline.indexOf('\n')

        if (secondNewlineChar === -1) {
          return
        }

        return fixer.replaceTextRange(
          range,
          rangeCodeBeforeFirstNewline + rangeCodeAfterFirstNewline.slice(secondNewlineChar + 1),
        )
      }
    }

    return {
      ObjectExpression: objectNode => {
        const objectStartLine = objectNode.loc.start.line
        const objectEndLine = objectNode.loc.end.line

        if(objectStartLine === objectEndLine) {
          return
        }

        objectNode.properties.forEach((property, i, properties) => {
          const propertyStartLine = property.loc.start.line
          const propertyEndLine = property.loc.end.line
          const isFirstProperty = i === 0

          // No padding at the start.
          if(isFirstProperty && isEmptyLine(propertyStartLine - objectStartLine)) {
            context.report({
              fix: getFixer([objectNode.range[0], property.range[0]]),
              messageId: 'redundant-before',
              node: property,
            })
          }

          const nextProperty = properties[i + 1]

          // No padding at the end.
          if(!nextProperty && isEmptyLine(objectEndLine - propertyEndLine)) {
            context.report({
              fix: getFixer([property.range[1], objectNode.range[1]]),
              messageId: 'redundant-after',
              node: property,
            })
          }

          if (!nextProperty) {
            return
          }

          // Multi-property object
          const nextPropertyStartLine = nextProperty.loc.start.line
          const distanceToNext = nextPropertyStartLine - propertyEndLine
          const rangeBetweenCurrentAndNext = [property.range[1], nextProperty.range[0]]

          if(isMultiline(property) && !isEmptyLine(distanceToNext)) {
            context.report({
              fix: getFixer(rangeBetweenCurrentAndNext, true),
              messageId: 'require-after',
              node: property
            })
          }

          if(!isMultiline(property) && isMultiline(nextProperty) && !isEmptyLine(distanceToNext)) {
            context.report({
              fix: getFixer(rangeBetweenCurrentAndNext, true),
              messageId: 'require-after',
              node: property,
            })
          }

          if(!isMultiline(property) && !isMultiline(nextProperty) && isEmptyLine(distanceToNext)) {
            context.report({
              fix: getFixer(rangeBetweenCurrentAndNext),
              messageId: 'redundant-after',
              node: property,
            })
          }
        })
      },
    }
  },
}

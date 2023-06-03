/**
 * @fileoverview Rule to check for AsExpression in TypeScript files.
 * @author Ottofeller
 */
"use strict";

const {AST_NODE_TYPES} = require('@typescript-eslint/utils')

/** @typedef {import('@typescript-eslint/utils').TSESTree.TSTypeAssertion} TSTypeAssertion */
/** @typedef {import('@typescript-eslint/utils').TSESTree.TSAsExpression} TSAsExpression */
/** @typedef {import('@typescript-eslint/utils').TSESTree.TypeNode} TypeNode */

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    docs: {
      description: 'Disallows the use of Type Assertions within TypeScript files',
      recommended: false,
      url: 'https://github.com/ottofeller/eslint-plugin-ottofeller.git'
    },

    messages: {noTypeAssertions: 'Type Assertions are not allowed'},
    type: 'suggestion',
  },

  create(context) {
    /**
     * @param {TypeNode} node
     * @returns {boolean}
     */
    function isConstAssertion(node) {
      return (
        node.type === AST_NODE_TYPES.TSTypeReference &&
        node.typeName.type === AST_NODE_TYPES.Identifier &&
        node.typeName.name === 'const'
      )
    }

    return {
      /** @param {TSTypeAssertion | TSAsExpression} node */
      'TSAsExpression, TSTypeAssertion'(node) {
        if (isConstAssertion(node.typeAnnotation)) {
          return
        }

        context.report({node, messageId: 'noTypeAssertions'})
      },
    }
  },
}

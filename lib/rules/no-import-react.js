/**
 * @fileoverview Rule to check namespace import from React.
 * @author Ottofeller
 */
"use strict";

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: 'suggestion',

    docs: {
      description: 'Disallows default import and namespace import from React',
      recommended: false,
      url: 'https://github.com/ottofeller/eslint-plugin-ottofeller.git'
    },

    messages: {
      noNamespaceImport: 'React namespace import is not allowed, use named imports instead',
    }
  },

  create(context) {
    return {
      ':matches(ImportNamespaceSpecifier, ImportDefaultSpecifier)': node => {
        if (node.parent.source.value === 'react') {
          context.report({messageId: 'noNamespaceImport', node});
        }
      },
    };
  }
};

/**
 * @fileoverview Rule to check for comment presence before useEffect calls.
 * @author Ottofeller
 */
"use strict";

/** @type Eslint.Rule */
module.exports = {
    meta: {
        type: 'suggestion',

        docs: {
            description: 'require a comment before useEffect call',
            recommended: false,
            url        : 'https://github.com/ottofeller/eslint-plugin-ottofeller.git'
        },

        schema: [
            {
                type      : 'object',

                properties: {
                    require: {
                        type      : 'object',
                        properties: {
                            CallExpression: {
                                type   : 'boolean',
                                default: true
                            },

                            MemberExpression: {
                                type   : 'boolean',
                                default: true
                            },
                        },
                        additionalProperties: false,
                        default             : {}
                    }
                },

                additionalProperties: false
            }
        ],

        messages: {
            missingComment: 'Missing comment before useEffect call. A description of the effect is required.'
        }
    },

    create(context) {
        const source = context.getSourceCode();

        const DEFAULT_OPTIONS = {
            CallExpression  : true,
            MemberExpression: true,
        };

        const options = Object.assign(DEFAULT_OPTIONS, context.options[0] && context.options[0].require);

        /**
         * Report the error message
         * @param {ASTNode} node node to report
         * @returns {void}
         */
        function report(node) {
            context.report({node, messageId: 'missingComment'});
        }

        /**
         * Check if a comment is present.
         * @param {ASTNode} node node to examine
         * @returns {void}
         */
        function checkComment(node) {
            const comments = source.getCommentsBefore(node);

            if (comments.length === 0) {
                report(node);
            }
        }

        return {
            'CallExpression[callee.name="useEffect"]': function(node) {
                if (options.CallExpression) {
                    checkComment(node);
                }
            },
            
            'CallExpression > MemberExpression[object.name="React"][property.name="useEffect"]': function(node) {
                if (options.MemberExpression) {
                    checkComment(node.parent);
                }
            }
        };
    }
};

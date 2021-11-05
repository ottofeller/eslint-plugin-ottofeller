/**
 * @fileoverview Rule to require particular call signature for Winston logger.
 * @author Ottofeller
 */
"use strict";

/**
 * Check whether an argument is a Literal of type String.
 * @param {*} loggerCallArgument
 * @returns {Boolean}
 */
function isString(loggerCallArgument) {
  return loggerCallArgument.type === 'Literal'
    && typeof loggerCallArgument.value === 'string'
}

/**
 * Check whether an argument is an Identifier.
 * @param {*} loggerCallArgument
 * @returns {Boolean}
 */
function isIdentifier(loggerCallArgument) {
  return loggerCallArgument.type === 'Identifier'
}

/**
 * Check whether an argument is an Object.
 * @param {*} loggerCallArgument
 * @returns {Boolean}
 */
function isObject(loggerCallArgument) {
  return loggerCallArgument.type === 'ObjectExpression'
}

/**
 * Check whether an object argument has 'message' a property.
 * Also applies to infoObject which is an arbitrary object.
 * The 'message' property is required in case of a single argument call.
 * @param {*} loggerCallArgument
 * @returns {Boolean}
 */
function hasMesasgeProp(loggerCallArgument) {
  return isObject(loggerCallArgument)
    && loggerCallArgument.properties.find(prop => prop.key.name === 'message')
}

/**
 * Check whether an argument is a legal LogEntry (has 'message' and 'level' properties).
 * @param {*} loggerCallArgument
 * @returns {Boolean}
 */
function isLogEntry(loggerCallArgument) {
  return hasMesasgeProp(loggerCallArgument)
    && loggerCallArgument.properties.find(prop => prop.key.name === 'level')
}

/**
 * Check whether an argument is a Function.
 * @param {*} loggerCallArgument
 * @returns {Boolean}
 */
function isFunction(loggerCallArgument) {
  return loggerCallArgument.type === 'FunctionExpression'
    || loggerCallArgument.type === 'ArrowFunctionExpression'
}

/**
 * Check whether an argument conforms to schema.
 * @param {*} loggerCallArgument
 * @returns {Boolean}
 */
function isSchemaConformant(schema, arg) {
  if (schema.type === 'object') {
    return arg.properties.some(
      prop => !isSchemaConformant(schema.properties[prop], prop.value)
    )
  } else {
    return (arg.type === 'Literal' && typeof arg.value === schema.type)
      || arg.type === 'Identifier'
  }
}

module.exports = {
  meta: {
    fixable: null,

    messages: {
      noEmptyCall: 'The logger shall not be called with no arguments.',
      onlyObjectInSingleArgumentCall:
        'If logger is called with a single argument, the argument shall be of type {{ type }}.',
      unknownLoggerLevel: 'Unknown logger level: {{ level }}.',
      unknownMessageType: 'Unknown message type: {{ type }}.',
      noMeta: 'No additional properties are allowed, got {{ count }}.',
      notLegalMetaCount: 'Additional properties expected: {{ expectedCount }}; got {{ count }}.',
      objectExpected: 'An object is expected as an additional property.',
      lackingProperties: 'Properties missing on the object: {{ props }}.',
      excessiveProperties: 'Properties of the object that are not defined in schema: {{ props }}.',
      improperTypes: 'Properties with invalid typings: {{ props }}; expected: {{ types }}.',
    },
    schema: [
      {
        type: "array",
        minItems: 1,
        items: {
          anyOf: [
            { // Simple property with 'name' and 'type'
              type: "object",
              properties: {
                name: {type: "string"},
                type: {
                  anyOf: [
                    {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        type: { 
                          enum: ["string", "number", "integer", "object", "array", "boolean", "null"],
                        },
                      },
                      additionalProperties: false,
                    },
                    {type: "object"},
                  ]
                },
              }
            },
            // Arbitrary object
            {type: "object"}
          ],
        },
        uniqueItems: true
      },
    ],
  },

  create(context) {
    const ALLOWED_LEVELS = [
      'info',
      'warn',
      'error',
      'warning',
      'crit',
    ]

    let highlightTarget

    /**
     * Check a logger call with a single argument.
     * Allows for:
     * - an Object with 'message' and 'level' properties;
     * - an Identifier with no further type checking.
     * @param {*[]} loggerCallArguments
     * @returns {Boolean}
     */
    function isLegalSingleArgumentLoggerCall(loggerCallArguments) {
      const [firstArg] = loggerCallArguments

      if (isLogEntry(firstArg)) {
        isLegalMetaObject(firstArg)
      } else if (!isIdentifier(firstArg)) {
        context.report({
          data: {
            type: "Object with 'message' and 'level' properties",
          },
          
          messageId: 'onlyObjectInSingleArgumentCall',
          node: highlightTarget
        })
      }
    }

    /**
     * Check a leveled logger call with a single argument.
     * Allows for:
     * - an Object with 'message' property;
     * - a String;
     * - an Identifier with no further type checking.
     * @param {*[]} loggerCallArguments
     * @returns {Boolean}
     */
    function isLegalSingleArgumentLeveledLoggerCall(loggerCallArguments) {
      const [firstArg] = loggerCallArguments

      if (!isString(firstArg) && !isIdentifier(firstArg)) {
        if (!hasMesasgeProp(firstArg)) {
          context.report({
            data: {
              type: "String or Object with 'message' property",
            },

            messageId: 'onlyObjectInSingleArgumentCall',
            node: highlightTarget
          })
        } else if (isObject(firstArg)) {
          isLegalMetaObject(firstArg)
        }
      }
    }

    /**
     * Check a logger call with a two and more arguments.
     * The first argument is log level, which must be a String or an Identifier.
     * The remaining arguments shall conform to leveled logger call signature.
     * @param {*[]} loggerCallArguments
     * @returns {Boolean}
     */
    function isLegalLoggerCall(loggerCallArguments) {
      const [level, ...leveledLogCallArguments] = loggerCallArguments

      if (!(isString(level) && ALLOWED_LEVELS.includes(level.value))
        && isIdentifier(level)
      ) {
        context.report({
          data: {
            level: level.value,
          },

          messageId: 'unknownLoggerLevel',
          node: highlightTarget
        })

        return
      }

      isLegalLeveledLoggerCall(leveledLogCallArguments)
    }

    /**
     * Check a leveled logger call.
     * The first argument is log message, which must be of type Literal.
     * The remaining arguments are disallowed.
     * @param {*[]} loggerCallArguments
     * @returns {Boolean}
     */
    function isLegalLeveledLoggerCall(leveledLogCallArguments) {
      const [message, ...metaAndCallback] = leveledLogCallArguments

      // Check message argument type, do not handle message of type any.
      if (!isString(message) && !isIdentifier(message)) {
        context.report({
          data: {
            type: message.type,
          },

          messageId: 'unknownMessageType',
          node: highlightTarget
        })
      }

      if (metaAndCallback.length === 0) {
        return
      }

      // allow for callbacks
      const lastArg = metaAndCallback[metaAndCallback.length - 1]
      const hasCallback = isFunction(lastArg)
      
      const meta = metaAndCallback.slice(0,
        hasCallback ? -1 : undefined,
      )

      // Proceed to the meta arguments
      return isLegalMetaArguments(meta)
    }

    /**
     * Check meta arguments.
     * @param {*[]} loggerCallArguments
     * @returns {Boolean}
     */
    function isLegalMetaArguments(metaArguments) {
      const requiredMetaLength = context.options[0].length

      if (requiredMetaLength === 0 && metaArguments.length > 0) {
        context.report({
          data: {
            count: metaArguments.length,
          },

          messageId: 'noMeta',
          node: highlightTarget,
        })
      }

      if (metaArguments.length !== requiredMetaLength) {
        // Check if all properties are wrapped in an object.
        if (metaArguments.length === 1) {
          isLegalMetaObject(metaArguments[0])
        } else { // Otherwise report
          context.report({
            data: {
              expectedCount: requiredMetaLength,
              count: metaArguments.length,
            },

            messageId: 'notLegalMetaCount',
            node: highlightTarget,
          })
        }
      } else {
        if (metaArguments.length === 1 && isObject(metaArguments[0])) {
          isLegalMetaObject(metaArguments[0])
          return
        }

        const requiredMeta = context.options[0]
        const notProperlyTypedArguments = []

        for (const [i, metaArg] of metaArguments.entries()) {
          if (!isSchemaConformant(requiredMeta[i], metaArg)) {
            notProperlyTypedArguments.push(requiredMeta[i])
          }
        }

        if (notProperlyTypedArguments.length > 0) {
          context.report({
            data: {
              props: notProperlyTypedArguments.map(arg => arg.name).join(', '),
              types: notProperlyTypedArguments.map(arg => arg.type).join(', '),
            },

            messageId: 'improperTypes',
            node: highlightTarget, 
          })
        }
      }
    }

    /**
     * Check meta argument as a single object.
     * @param {*} loggerCallArguments
     * @returns {Boolean}
     */
    function isLegalMetaObject(metaObject) {
      if (!isObject(metaObject)) {
        context.report({
          messageId: 'objectExpected',
          node: highlightTarget,
        })

        return
      }

      const meta = Object.assign({}, metaObject)
      
      meta.properties = meta.properties.filter(
        prop => prop.key.name !== 'message' && prop.key.name !== 'level'
      )

      const requiredProperties = context.options[0].map(required => required.name)
      const actualProperties = meta.properties.map(actual => actual.key.name)

      if (requiredProperties.length !== actualProperties.length) {
        context.report({
          data: {
            expectedCount: requiredProperties.length,
            count: actualProperties.length,
          },

          messageId: 'notLegalMetaCount',
          node: highlightTarget,
        })
      }

      const lackingProperties = requiredProperties.filter(
        required => !actualProperties.includes(required)
      )

      if (lackingProperties.length > 0) {
        context.report({
          data: {
            props: lackingProperties.join(', '),
          },

          messageId: 'lackingProperties',
          node: highlightTarget,
        })
      }

      const excessiveProperties = actualProperties.filter(
        actual => !requiredProperties.includes(actual)
      )

      if (excessiveProperties.length > 0) {
        context.report({
          data: {
            props: excessiveProperties.join(', '),
          },

          messageId: 'excessiveProperties',
          node: highlightTarget,
        })
      }
    }

    /**
     * Returns a function used for node processing.
     * 
     * @param {Boolean} leveled Indicates whether the logger call is leveled or not.
     * @returns {Function}
     */
    function processLoggerCall(leveled) {
      return (node) => {
        const args = [...node.parent.arguments]
        highlightTarget = node.parent

        // Disallow logger calls with no parameters
        if (args.length === 0) {
          context.report({
            messageId: 'noEmptyCall',
            node: highlightTarget
          })
        } 
        // A single argument call shall be performed with an ObjectExpression argument on Log
        // and with either String or ObjectExpression argument on LeveledLog
        else if (args.length === 1) {
          if (leveled) {
            isLegalSingleArgumentLeveledLoggerCall(args)
          } else {
            isLegalSingleArgumentLoggerCall(args)
          }
        }
        // A multi argument call shall have legal signature
        else {
          if (leveled) {
            isLegalLeveledLoggerCall(args)
          } else {
            isLegalLoggerCall(args)
          }
        }
      }
    }

    return {
      'CallExpression > MemberExpression[object.name="logger"][property.name="log"]': processLoggerCall(),
      'CallExpression > MemberExpression[object.name="logger"][property.name="info"]': processLoggerCall(true),
      'CallExpression > MemberExpression[object.name="logger"][property.name="warn"]': processLoggerCall(true),
      'CallExpression > MemberExpression[object.name="logger"][property.name="warning"]': processLoggerCall(true),
      'CallExpression > MemberExpression[object.name="logger"][property.name="error"]': processLoggerCall(true),
      'CallExpression > MemberExpression[object.name="logger"][property.name="critical"]': processLoggerCall(true),
    }
  },
}

/**
 * The following lines show possible call signatures per Winston typings.
 * Note that the case with (message: any) argument is not covered by the rule.
 */

// --|level        | message        | meta     | callback             |---------
//   
// interface LogMethod {
//   (level: string, message: string,            callback: LogCallback): Logger;
//   (level: string, message: string, meta: any, callback: LogCallback): Logger;
//   (level: string, message: string, ...meta: any[]                  ): Logger;
//   (                                entry: LogEntry                 ): Logger;
//   (level: string, message: any                                     ): Logger;
// }

// interface LeveledLogMethod {
//   (               message: string,            callback: LogCallback): Logger;
//   (               message: string, meta: any, callback: LogCallback): Logger;
//   (               message: string, ...meta: any[]                  ): Logger;
//   (               message: any                                     ): Logger;
//   (                                infoObject: object              ): Logger;
// }

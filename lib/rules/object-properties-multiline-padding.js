const isMultiline = element => Boolean(element.loc.end.line - element.loc.start.line)
const isEmptyLine = distance => distance > 1
const isNoEmptyLine = distance => distance < 2

module.exports = {
  meta: {
    fixable: null,

    messages: {
      'redundant-after' : 'Redundant empty line after a multiline property',
      'redundant-before': 'Redundant empty line before a multiline property',
      'require-after'   : 'Require empty line after a multiline property',
      'require-before'  : 'Require empty line before a multiline property',
    },
  },

  create(context) {
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
          const previousProperty = properties[i - 1]

          // No padding at the start.
          if(!previousProperty && isEmptyLine(propertyStartLine - objectStartLine)) {
            context.report({messageId: 'redundant-before', node: property})
          }

          const nextProperty = properties[i + 1]

          // No padding at the end.
          if(!nextProperty && isEmptyLine(objectEndLine - propertyEndLine)) {
            context.report({messageId: 'redundant-after', node: property})
          }

          // Multi-property object
          if(previousProperty) {
            const previousPropertyEndLine = previousProperty.loc.end.line
            const distanceToPrevious = propertyStartLine - previousPropertyEndLine

            if(isMultiline(property) && isNoEmptyLine(distanceToPrevious)) {
              context.report({messageId: 'require-before', node: property})
            }

            if(!isMultiline(property) && !isMultiline(previousProperty) && isEmptyLine(distanceToPrevious)) {
              context.report({messageId: 'redundant-before', node: property})
            }
          }

          if(nextProperty) {
            const nextPropertyStartLine = nextProperty.loc.start.line
            const distanceToNext = nextPropertyStartLine - propertyEndLine

            if(isMultiline(property) && isNoEmptyLine(distanceToNext)) {
              context.report({messageId: 'require-after', node: property})
            }

            if(!isMultiline(property) && !isMultiline(nextProperty) && isEmptyLine(distanceToNext)) {
              context.report({messageId: 'redundant-after', node: property})
            }
          }
        })
      },
    }
  },
}

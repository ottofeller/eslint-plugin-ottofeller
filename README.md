# eslint-plugin-ottofeller
## Install

```shell
npm install @ottofeller/eslint-plugin-ottofeller --save-dev
```

## Usage

Add `ottofeller` to the plugins section of your eslint configuration:

```json
{
  "plugins": [
    "@ottofeller/ottofeller"
  ]
}
```

Then configure the rules you want to use under the rules section.

```json
{
  "rules": {
    "@ottofeller/ottofeller/rule-name-without-options": [
      "error"
    ],
    "@ottofeller/ottofeller/rule-name-with-options": [
      "error",
      {
        "option": "value"
      }
    ]
  }
}
```
## Rules

1. **ottofeller/jsx-newline-block**
```json
{
  "rules": {
    "@ottofeller/ottofeller/jsx-newline-block": ["error"]
  }
}
```

2. **ottofeller/require-comment-before-useeffect**

The rule has a single option, which is an object with `require` property. The latter one is an object that defines the following options:
* `CallExpression` - requires a comment before `useEffect(...)`; defaults to true.
* `MemberExpression` - requires a comment before `React.useEffect(...)`; defaults to true.
```json
{
  "rules": {
    "@ottofeller/ottofeller/require-comment-before-useeffect": ["error", {
        "require": {
            "CallExpression": true,
            "MemberExpression": false,
        }
    }],
  }
}
```

All the options are enabled by default. To use defaults just keep the config object off.
```json
{
  "rules": {
    "@ottofeller/ottofeller/require-comment-before-useeffect": ["error"],
  }
}
```

3. **ottofeller/no-import-react**

The rule forbids namespace and default imports from React. Named imports are encouraged.

```json
{
  "rules": {
    "@ottofeller/ottofeller/no-import-react": ["error"],
  }
}
```


4. **ottofeller/object-properties-multiline-padding**

For multiline Object Expressions the rule requires:
- empty lines before and after multiline properties;
- no empty lines between single-line properties;
- no empty lines at the start and at the end of the object.

NOTE: the rule does not handle comments within Object Expressions.

An autofix is available for the rule.

```json
{
  "rules": {
    "@ottofeller/ottofeller/object-properties-multiline-padding": ["error"],
  }
}
```
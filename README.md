# eslint-plugin-ottofeller
## Install

```shell
npm install eslint-plugin-ottofeller@npm:@ottofeller/eslint-plugin-ottofeller --save-dev
```

## Usage

Add `ottofeller` to the plugins section of your eslint configuration:

```json
{
  "plugins": [
    "ottofeller"
  ]
}
```

Then configure the rules you want to use under the rules section.

```json
{
  "rules": {
    "ottofeller/rule-name-without-options": [
      "error"
    ],
    "ottofeller/rule-name-with-options": [
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
    "ottofeller/jsx-newline-block": [
      "error"
    ]
  }
}
```

# eslint-plugin-ottofeller
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

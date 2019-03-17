import CodeMirror from 'codemirror'
import jsonLint from 'json-lint'
window.jsonlint = jsonLint

CodeMirror.registerHelper('lint', 'json', text => {
  let found = []
  const lint = jsonLint(text, {})
  if (lint.error) {
    found.push({
      from: CodeMirror.Pos(lint.line - 1, lint.character - 1),
      to: CodeMirror.Pos(lint.line - 1, lint.character),
      message: lint.error,
    })
  }
  return found
})

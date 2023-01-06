// @ts-check

const { ParsedImportExportStatement } = require('denoify')

const moduleName = 'uvu'

/** @type { import('denoify').Replacer } */
const replacer = async params => {
  const { parsedImportExportStatement } = params

  if (parsedImportExportStatement.parsedArgument.nodeModuleName !== moduleName) {
    return undefined
  }

  return ParsedImportExportStatement.stringify({
    ...parsedImportExportStatement,
    'parsedArgument': {
      'type': 'URL',
      'url': '../uvu.ts'
    }
  })
}

module.exports = {
  replacer
}

// @ts-check

const { makeThisModuleAnExecutableReplacer } = require('denoify')

makeThisModuleAnExecutableReplacer(async params => {
  for (const { replacer } of await Promise.all([
    require('./uvu')
  ])) {
    const output = await replacer(params)

    if (output !== undefined) {
      return output
    }
  }

  return undefined
})

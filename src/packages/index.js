const { executeCommandOnPackages, getAllPackages } = require('../tools')
const findRepoRoot = require('organic-stem-skeleton-find-root')

module.exports = function (angel) {
  const ROOT = process.cwd()

  require('./create-package')(angel)

  angel.on(/package (.*) -- (.*)/, function (angel, done) {
    executeCommandOnPackages({
      root: ROOT,
      cmd: angel.cmdData[2],
      packageName: angel.cmdData[1],
      forwardStdin: true
    }).then(() => done()).catch(done)
  })
    .description('executes :cmd on package by its :name')
    .example('$ angel package :name -- :cmd')
  angel.on(/packages -- (.*)/, function (angel, done) {
    executeCommandOnPackages({
      root: ROOT,
      cmd: angel.cmdData[1]
    }).then(() => done()).catch(done)
  })
    .description('executes :cmd on all packages')
    .example('packages -- :cmd')
  angel.on(/^packages$/, async function (angel, done) {
    const repoRoot = await findRepoRoot()
    const packages = await getAllPackages(repoRoot)
    for (let i = 0; i < packages.length; i++) {
      console.info(`${packages[i].name}@${packages[i].version} -> ${packages[i].cwd}`)
    }
    done()
  })
    .description('lists all found packages')
    .example('packages')
  angel.on(/^packages.json$/, async function (angel, done) {
    const repoRoot = await findRepoRoot()
    const packages = await getAllPackages(repoRoot)
    console.info(JSON.stringify(packages))
    done()
  })
    .description('dumps all found packages')
    .example('packages.json')
}

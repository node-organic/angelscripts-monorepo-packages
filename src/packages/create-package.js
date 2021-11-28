const path = require('path')
const util = require('util')
const exec = util.promisify(require('child_process').exec)
const prompts = require('prompts')

module.exports = function (angel) {
  angel.on('create package :name', async function (angel) {
    const answers = {
      packageName: angel.cmdData.name
    }
    await createPackage(answers)
  })
  angel.on('create package', async function (angel) {
    const questions = [
      {
        type: 'text',
        message: 'package name',
        name: 'packageName',
        initial: generatePackageName()
      }
    ]
    const answers = await prompts(questions)
    await createPackage(answers)
  })
}

const createPackage = async function (answers) {
  const packagepath = path.join('packages', answers.packageName)
  await exec(`mkdir -p ${packagepath}`)
  await exec('npm init -y', { cwd: path.join(process.cwd(), packagepath) })
  console.info('done')
}

const generatePackageName = function () {
  return 'package' + Math.ceil(Math.random() * 100)
}

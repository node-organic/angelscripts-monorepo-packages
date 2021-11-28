const { exec } = require('child_process')
const colors = require('ansi-colors')

const path = require('path')
const { forEach, filter } = require('p-iteration')

const fsDir = require('util').promisify(require('fs').readdir)
const lstat = require('util').promisify(require('fs').lstat)

const terminateAsync = async function (pid) {
  return new Promise((resolve, reject) => {
    process.kill(pid, err => {
      if (err) return reject(err)
      resolve()
    })
  })
}

const formatGreen = function (value) {
  return '[' + colors.green(value) + ']'
}

const executeCommand = async function ({ name, cmd, cwd, env, forwardStdin }) {
  return new Promise((resolve, reject) => {
    console.log(formatGreen(name), cmd, '@', cwd)
    const child = exec(cmd, {
      cwd: cwd,
      env: env
    })
    child.stdout.on('data', chunk => {
      console.log(formatGreen(name), chunk.toString())
    })
    child.stderr.on('data', chunk => {
      console.error(formatGreen(name), colors.red(chunk.toString()))
    })
    if (forwardStdin) {
      process.stdin.pipe(child.stdin)
      process.stdin.resume()
    }
    child.on('exit', status => {
      if (status !== 0) return reject(new Error(formatGreen(name) + ' ' + cmd + ' returned ' + status))
      resolve()
    })
  })
}

module.exports.executeCommandOnPackages = async function ({ root, cmd, packageName, forwardStdin }) {
  const tasks = []
  const packages = await module.exports.getAllPackages(root)
  packages.forEach((p) => {
    if (packageName && p.name !== packageName) return
    tasks.push({
      name: p.name,
      cwd: p.cwd
    })
  })
  if (tasks.length === 0) {
    throw new Error('no cells found')
  }
  const runningChilds = []
  const childHandler = function (child) {
    runningChilds.push(child)
    child.on('close', () => {
      runningChilds.splice(runningChilds.indexOf(child), 1)
    })
  }
  await forEach(tasks, async taskInfo => {
    return executeCommand({
      name: taskInfo.name,
      cmd: cmd,
      cwd: path.join(root, taskInfo.cwd),
      env: process.env,
      childHandler: childHandler,
      forwardStdin: forwardStdin
    })
  })
  runningChilds.forEach(function (child) {
    child.terminating = true
  })
  const pids = runningChilds.map(v => v.pid)
  try {
    await forEach(pids, terminateAsync)
  } catch (e) { /** ignore e */ }
}

module.exports.getAllPackages = async function (root) {
  let names = await fsDir(path.join(root, 'packages'))
  names = await filter(names, async (name) => {
    const stat = await lstat(path.join(root, 'packages', name))
    return stat.isDirectory()
  })
  return names.map(v => {
    const packagejson = require(path.join(root, 'packages', v, 'package.json'))
    return {
      cwd: path.join('packages', v),
      version: packagejson.version,
      name: v,
      packagejson: packagejson
    }
  })
}

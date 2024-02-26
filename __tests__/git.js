jest.mock('@actions/exec')

const {GitAdapter} = require('../src/git')
const {exec} = require('@actions/exec')

/* eslint-disable @typescript-eslint/explicit-function-return-type */

beforeEach(() => {
  exec.exec = jest.fn()

  exec.exec.mockReturnValue(Promise.resolve(0))
})

function createParams() {
  return {
    packages: 'generator-test',
    generator: 'test',
    untrackedFiles: ['./src'],
    skipInstall: true,
    answers: {my_question: 'my_answers'},
    options: {my_options: 'my_value'},
    cwd: './generated',
    npmSudo: true,
    gitConfig: {'user.name': 'github'},
    gitRemoteOriginUrl: 'https://github.com/test/repo',
    githubToken: 'my token',
    githubPrCommitMessage: 'My commit message',
    githubPrBranch: 'generator/my-branch',
    githubPrTitle: 'Generator PR title',
    githubPrBody: 'Generator PR Body'
  }
}

test('GitAdapter#constructor args', async () => {
  const params = createParams()
  const adapter = new GitAdapter(params, exec.exec)

  expect(adapter.params).toBe(params)
  expect(adapter.execute).toBe(exec.exec)
})

test('GitAdapter#constructor default', async () => {
  const params = createParams()
  const adapter = new GitAdapter(params)

  expect(adapter.params).toBe(params)
  expect(adapter.execute).toBeDefined()
})

test('GitAdapter#configure', async () => {
  const params = createParams()
  const adapter = new GitAdapter(params, exec.exec)

  expect(await adapter.configure()).toHaveLength(2)

  expect(exec.exec).toHaveBeenCalledWith('git config --global', ['user.name', 'github'])
  expect(exec.exec).toHaveBeenCalledWith('git remote set-url origin', ['https://github.com/test/repo'])
})

test('GitAdapter#configure with no origin', async () => {
  const params = {...createParams(), gitRemoteOriginUrl: ''}
  const adapter = new GitAdapter(params, exec.exec)

  expect(await adapter.configure()).toHaveLength(1)

  expect(exec.exec).toHaveBeenCalledTimes(1)
  expect(exec.exec).toHaveBeenCalledWith('git config --global', ['user.name', 'github'])
})

test('GitAdapter#diffSummary', async () => {
  const params = createParams()
  const adapter = new GitAdapter(params, exec.exec)

  expect(await adapter.diffSummary()).toHaveLength(2)

  expect(exec.exec).toHaveBeenCalledWith('git status')
  expect(exec.exec).toHaveBeenCalledWith('git diff --stat HEAD .')
})

test('GitAdapter#diffFiles', async () => {
  const lines = ['l1', 'l2']
  const params = createParams()
  const adapter = new GitAdapter(params, exec.exec)

  exec.exec.mockImplementation((command, args, options) => {
    expect(command).toBeDefined()
    expect(options).toBeDefined()
    expect(args).toBeDefined()

    expect(options.listeners).toBeDefined()
    expect(options.listeners.stdline).toBeDefined()

    for (const line of lines) {
      options.listeners.stdline(line)
    }
  })

  expect(await adapter.diffFiles()).toEqual(lines)

  expect(exec.exec).toHaveBeenCalledWith('git diff --name-only HEAD .', [], {
    listeners: {
      stdline: expect.any(Function)
    }
  })
})

test('GitAdapter#addFiles', async () => {
  const params = createParams()
  const adapter = new GitAdapter(params, exec.exec)

  expect(await adapter.addFiles()).toEqual(0)

  expect(exec.exec).toHaveBeenCalledWith('git add .')
})

test('GitAdapter#commitChanges', async () => {
  const params = createParams()
  const adapter = new GitAdapter(params, exec.exec)

  expect(await adapter.commitChanges()).toEqual(0)

  expect(exec.exec).toHaveBeenCalledWith('git commit -m', ['My commit message'])
})

test('GitAdapter#createBranch', async () => {
  const params = createParams()
  const adapter = new GitAdapter(params, exec.exec)

  expect(await adapter.createBranch()).toEqual(0)

  expect(exec.exec).toHaveBeenCalledWith('git checkout -b', ['generator/my-branch'])
})

test('GitAdapter#pushGithubPrBranch', async () => {
  const params = createParams()
  const adapter = new GitAdapter(params, exec.exec)

  expect(await adapter.pushGithubPrBranch()).toEqual(0)

  expect(exec.exec).toHaveBeenCalledWith('git push origin', ['generator/my-branch', '--force'])
})

test('GitAdapter#revertUntrackedFiles', async () => {
  const params = createParams()
  const adapter = new GitAdapter(params, exec.exec)

  expect(await adapter.revertUntrackedFiles()).toEqual([0, 0])

  expect(exec.exec).toHaveBeenCalledWith('git restore --staged', ['./src'])
  expect(exec.exec).toHaveBeenCalledWith('git checkout HEAD', ['./src'])
})

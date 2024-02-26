jest.mock('@actions/exec')

const {exec} = require('@actions/exec')
const {YeomanRunner} = require('../src/yeoman')

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

function createEnvironment() {
  return {
    lookup: jest.fn(),
    run: jest.fn()
  }
}

test('YeomanRunner#constructor args', async () => {
  const params = createParams()
  const environment = createEnvironment()
  const runner = new YeomanRunner(params, environment, exec.exec)

  expect(runner.params).toBe(params)
  expect(runner.env).toBe(environment)
  expect(runner.execute).toBe(exec.exec)
})

test('YeomanRunner#constructor defaults', async () => {
  const params = createParams()
  const runner = new YeomanRunner(params)

  expect(runner.params).toBe(params)
  expect(runner.env).toBeDefined()
  expect(runner.execute).toBeDefined()
})

test('YeomanRunner#installDependencies', async () => {
  const params = createParams()
  const environment = createEnvironment()
  const runner = new YeomanRunner(params, environment, exec.exec)

  await runner.installDependencies()

  expect(exec.exec).toHaveBeenCalledWith('sudo npm', ['install', 'generator-test', '--global', '--quiet'])
})

test('YeomanRunner#installDependencies no packages', async () => {
  const environment = createEnvironment()
  const params = {...createParams(), packages: ''}
  const runner = new YeomanRunner(params, environment, exec.exec)

  await runner.installDependencies()

  expect(exec.exec).toBeCalledTimes(0)
})

test('YeomanRunner#installDependencies no sudo', async () => {
  const environment = createEnvironment()
  const params = {...createParams(), npmSudo: false}
  const runner = new YeomanRunner(params, environment, exec.exec)

  await runner.installDependencies()

  expect(exec.exec).toHaveBeenCalledWith('npm', ['install', 'generator-test', '--global', '--quiet'])
})

test('YeomanRunner#run resolve', async () => {
  const params = createParams()
  const environment = createEnvironment()
  const runner = new YeomanRunner(params, environment, exec.exec)

  environment.run.mockImplementation((generator, options, cb) => {
    expect(generator).toBeDefined()
    expect(options).toBeDefined()
    expect(cb).toBeDefined()

    cb()
  })

  await runner.run()

  expect(environment.run).toHaveBeenCalledWith(
    'test',
    {
      force: true,
      skipInstall: true,
      my_options: 'my_value'
    },
    expect.any(Function)
  )
})

test('YeomanRunner#run reject', async () => {
  const params = createParams()
  const err = new Error('Some error')
  const environment = createEnvironment()
  const runner = new YeomanRunner(params, environment, exec.exec)

  expect.assertions(5)

  environment.run.mockImplementation((generator, options, cb) => {
    expect(generator).toBeDefined()
    expect(options).toBeDefined()
    expect(cb).toBeDefined()

    cb(err)
  })

  try {
    await runner.run()
  } catch (error) {
    expect(error).toBe(err)
  }

  expect(environment.run).toHaveBeenCalledWith(
    'test',
    {
      force: true,
      skipInstall: true,
      my_options: 'my_value'
    },
    expect.any(Function)
  )
})

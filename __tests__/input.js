const {env} = require('process')
const {readParams} = require('../src/input')
const {load} = require('js-yaml')
const {resolve} = require('path')
const {readFileSync} = require('fs')

beforeEach(() => {
  const filePath = resolve(__dirname, '../', 'action.yml')
  const contents = readFileSync(filePath, 'utf8')
  const data = load(contents)

  for (const key in data.inputs) {
    const envName = `INPUT_${key.toUpperCase()}`
    const envValue = data.inputs[key].default || ''

    env[envName] = envValue
  }
})

test('readParams defaults', () => {
  env['INPUT_GENERATOR'] = 'test'

  expect(readParams()).toEqual({
    packages: '',
    generator: 'test',
    untrackedFiles: [],
    skipInstall: true,
    answers: {},
    options: {},
    cwd: '.',
    npmSudo: false,
    gitConfig: {
      'user.name': 'github-actions',
      'user.email': 'github-actions@github.com'
    },
    gitRemoteOriginUrl: '',
    githubToken: '',
    githubPrCommitMessage: 'Run generator test',
    githubPrBranch: 'generator/test',
    githubPrTitle: 'Run generator test',
    githubPrBody: 'Run generator test'
  })
})

test('readParams values', () => {
  env['INPUT_GENERATOR'] = 'test'
  env['INPUT_PACKAGE'] = 'generator-test'
  env['INPUT_UNTRACKED-FILES'] = '["./src"]'
  env['INPUT_SKIP-INSTALL'] = 'true'
  env['INPUT_ANSWERS'] = '{"my_question":"my_answers"}'
  env['INPUT_OPTIONS'] = '{"my_options":"my_value"}'
  env['INPUT_CWD'] = './generated'
  env['INPUT_NPM-SUDO'] = 'true'
  env['INPUT_GIT-CONFIG'] = '{"user.name":"github"}'
  env['INPUT_GIT-REMOTE-ORIGIN-URL'] = 'https://github.com/test/repo'
  env['INPUT_GITHUB-TOKEN'] = 'my token'
  env['INPUT_GITHUB-PR-COMMIT-MESSAGE'] = 'My commit message'
  env['INPUT_GITHUB-PR-BRANCH'] = 'generator/my-branch'
  env['INPUT_GITHUB-PR-TITLE'] = 'Generator PR title'
  env['INPUT_GITHUB-PR-BODY'] = 'Generator PR Body'

  expect(readParams()).toEqual({
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
  })
})

test('readParams invalid json', () => {
  env['INPUT_GENERATOR'] = 'test'
  env['INPUT_ANSWERS'] = '{"my_question}'

  expect(readParams).toThrow('Unexpected end of JSON input')
})

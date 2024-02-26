jest.mock('@actions/github')

const {context, getOctokit} = require('@actions/github')
const {GithubAdapter} = require('../src/github')

/* eslint-disable @typescript-eslint/explicit-function-return-type */

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

function createOctokit() {
  return {
    rest: {
      pulls: {
        create: jest.fn(),
        list: jest.fn()
      }
    }
  }
}

function createPullEntry(id, base, head) {
  return {
    id,
    base: {ref: base},
    head: {ref: head},
    html_url: `http://localhost/test/pr/${id}`
  }
}

test('GithubAdapter#constructor', async () => {
  const params = createParams()
  const octokit = createOctokit()
  const adapter = new GithubAdapter(params, octokit)

  expect(adapter.params).toBe(params)
  expect(adapter.octokit).toBe(octokit)
})

test('GithubAdapter#constructor args', async () => {
  const params = createParams()
  const octokit = createOctokit()

  getOctokit.mockReturnValue(octokit)

  const adapter = new GithubAdapter(params)

  expect(getOctokit).toHaveBeenCalledWith(params.githubToken)

  expect(adapter.params).toBe(params)
  expect(adapter.octokit).toBe(octokit)
})

test('GithubAdapter#createPull', async () => {
  const result = {data: jest.fn()}
  const octokit = createOctokit()

  context.ref = 'refs/heads/main'
  octokit.rest.pulls.create.mockReturnValue(Promise.resolve(result))

  const params = createParams()
  const adapter = new GithubAdapter(params, octokit)

  expect(await adapter.createPull()).toBe(result.data)

  expect(octokit.rest.pulls.create).toHaveBeenCalledWith({
    base: 'main',
    body: 'Generator PR Body',
    head: 'generator/my-branch',
    title: 'Generator PR Body'
  })
})

test('GithubAdapter#findOpenPull', async () => {
  const octokit = createOctokit()
  const result = {
    data: [
      createPullEntry(111, 'master', 'generator/my-branch'),
      createPullEntry(222, 'main', 'generator/my-branch'),
      createPullEntry(333, 'master', 'generator/my-branch')
    ]
  }

  context.ref = 'refs/heads/main'
  octokit.rest.pulls.list.mockReturnValue(Promise.resolve(result))

  const params = createParams()
  const adapter = new GithubAdapter(params, octokit)

  expect(await adapter.findOpenPull()).toEqual({
    id: 222,
    html_url: 'http://localhost/test/pr/222',
    head: {ref: 'generator/my-branch'},
    base: {ref: 'main'}
  })

  expect(octokit.rest.pulls.list).toHaveBeenCalledWith({
    head: 'generator/my-branch',
    base: 'main',
    state: 'open'
  })
})

test('GithubAdapter#openPullRequest new', async () => {
  const octokit = createOctokit()
  const listResult = {data: []}
  const createResult = {
    data: createPullEntry(123, 'master', 'generator/my-branch')
  }

  context.ref = 'refs/heads/main'
  octokit.rest.pulls.list.mockReturnValue(Promise.resolve(listResult))
  octokit.rest.pulls.create.mockReturnValue(Promise.resolve(createResult))

  const params = createParams()
  const adapter = new GithubAdapter(params, octokit)

  expect(await adapter.openPullRequest()).toBe(createResult.data.id)

  expect(octokit.rest.pulls.list).toHaveBeenCalledWith({
    head: 'generator/my-branch',
    base: 'main',
    state: 'open'
  })

  expect(octokit.rest.pulls.create).toHaveBeenCalledWith({
    base: 'main',
    body: 'Generator PR Body',
    head: 'generator/my-branch',
    title: 'Generator PR Body'
  })
})

test('GithubAdapter#openPullRequest existing', async () => {
  const octokit = createOctokit()
  const createResult = {
    data: createPullEntry(222, 'main', 'generator/my-branch')
  }
  const listResult = {data: [createPullEntry(111, 'main', 'generator/my-branch')]}

  context.ref = 'refs/heads/main'
  octokit.rest.pulls.list.mockReturnValue(Promise.resolve(listResult))
  octokit.rest.pulls.create.mockReturnValue(Promise.resolve(createResult))

  const params = createParams()
  const adapter = new GithubAdapter(params, octokit)

  expect(await adapter.openPullRequest()).toBe(111)

  expect(octokit.rest.pulls.list).toHaveBeenCalledWith({
    head: 'generator/my-branch',
    base: 'main',
    state: 'open'
  })

  expect(octokit.rest.pulls.create).not.toBeCalled()
})

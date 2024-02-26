import * as core from '@actions/core'
import {Answers} from 'inquirer'

export interface Params {
  generator: string
  packages?: string
  untrackedFiles: string[]
  skipInstall: boolean
  answers: Answers
  options: object
  cwd: string
  npmSudo: boolean
  gitConfig: Record<string, string>
  gitRemoteOriginUrl?: string
  githubToken: string
  githubPrCommitMessage: string
  githubPrBranch: string
  githubPrTitle: string
  githubPrBody: string
}

function getInput(name: string, defaultValue = ''): string {
  return core.getInput(name) || defaultValue
}

function getJsonInput<T>(name: string): T {
  const input = getInput(name)

  try {
    return JSON.parse(input)
  } catch (e) {
    core.error(`Failed to parse json input ${name}:'${input}'`)
    throw e
  }
}

function getGithubPrCommitMessageInput(): string {
  return getInput('github-pr-commit-message', `Run generator ${getInput('generator')}`)
}

function getGithubPrBranchInput(): string {
  return getInput('github-pr-branch', `generator/${getInput('generator').replace(':', '/')}`)
}

function getGithubPrBodyInput(): string {
  return getInput('github-pr-body', `Run generator ${getInput('generator')}`)
}

function getGithubPrTitleInput(): string {
  return getInput('github-pr-title', `Run generator ${getInput('generator')}`)
}

export function readParams(): Readonly<Params> {
  return {
    packages: getInput('package'),
    generator: getInput('generator'),
    untrackedFiles: getJsonInput('untracked-files'),
    skipInstall: getJsonInput('skip-install'),
    answers: getJsonInput('answers'),
    options: getJsonInput('options'),
    cwd: getInput('cwd'),
    npmSudo: getJsonInput('npm-sudo'),
    gitConfig: getJsonInput('git-config'),
    gitRemoteOriginUrl: getInput('git-remote-origin-url'),
    githubToken: getInput('github-token'),
    githubPrCommitMessage: getGithubPrCommitMessageInput(),
    githubPrBranch: getGithubPrBranchInput(),
    githubPrTitle: getGithubPrTitleInput(),
    githubPrBody: getGithubPrBodyInput()
  }
}

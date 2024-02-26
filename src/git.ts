import * as exec from '@actions/exec'
import {Params} from './input'

type ExecCallback = (command: string, args?: string[], options?: exec.ExecOptions) => Promise<number>

export class GitAdapter {
  params: Params
  execute: ExecCallback

  constructor(params: Params, execute: ExecCallback | undefined = undefined) {
    this.params = params
    this.execute = execute || exec.exec
  }

  async configure(): Promise<number[]> {
    const originUrl = this.params.gitRemoteOriginUrl
    const config = this.params.gitConfig
    const codes = []

    for (const [key, value] of Object.entries(config)) {
      codes.push(await this.execute('git config --global', [key, value]))
    }

    if (originUrl) {
      codes.push(await this.execute('git remote set-url origin', [originUrl]))
    }

    return Promise.resolve(codes)
  }

  async diffSummary(): Promise<number[]> {
    const status = this.execute('git status')
    const stats = this.execute('git diff --stat HEAD .')

    return [await status, await stats]
  }

  async diffFiles(): Promise<string[]> {
    const lines: string[] = []
    const command = 'git diff --name-only HEAD .'
    const options = {
      listeners: {
        stdline: (line: string) => {
          lines.push(line)
        }
      }
    }

    await this.execute(command, [], options)

    return lines
  }

  async addFiles(): Promise<number> {
    return this.execute('git add .')
  }

  async commitChanges(): Promise<number> {
    const command = 'git commit -m'
    const message = this.params.githubPrCommitMessage

    return this.execute(command, [message])
  }

  async createBranch(): Promise<number> {
    const command = 'git checkout -b'
    const branch = this.params.githubPrBranch

    return this.execute(command, [branch])
  }

  async pushGithubPrBranch(): Promise<number> {
    const branch = this.params.githubPrBranch
    const command = 'git push origin'

    return this.execute(command, [branch, '--force'])
  }

  async revertUntrackedFiles(): Promise<number[]> {
    const codes = []
    const untrackedFiles = this.params.untrackedFiles

    for (const pattern of untrackedFiles) {
      codes.push(await this.execute('git restore --staged', [pattern]))
      codes.push(await this.execute('git checkout HEAD', [pattern]))
    }

    return Promise.resolve(codes)
  }
}

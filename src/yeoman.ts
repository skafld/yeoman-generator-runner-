import {Params} from './input'
import {StorageAdapter} from './adapter'

import * as core from '@actions/core'
import * as exec from '@actions/exec'
import Environment from 'yeoman-environment'

type ExecCallback = (command: string, args?: string[], options?: exec.ExecOptions) => Promise<number>

export class YeomanRunner {
  params: Params
  execute: ExecCallback
  env: Environment<Environment.Options>

  constructor(
    params: Params,
    env: Environment<Environment.Options> | undefined = undefined,
    execute: ExecCallback | undefined = undefined
  ) {
    this.params = params
    this.execute = execute || exec.exec
    this.env = env || Environment.createEnv([], {cwd: params.cwd}, new StorageAdapter(params.answers))
  }

  async installDependencies(): Promise<Environment.LookupGeneratorMeta[]> {
    const packages = this.params.packages
    const command = this.params.npmSudo ? 'sudo npm' : 'npm'

    if (packages) {
      core.info(`Instaling ${packages}`)
      await this.execute(command, ['install', packages, '--global', '--quiet'])
    }

    core.info(`Indexing generators`)
    return this.env.lookup()
  }

  async run(): Promise<void> {
    const generator = this.params.generator
    const skipInstall = this.params.skipInstall
    const options: object = {
      ...this.params.options,
      skipInstall,
      force: true
    }

    return new Promise((resolve, reject) => {
      core.info(`Running generator ${generator}`)

      this.env.run(generator, options, err => {
        core.info(`Generator ${generator} done`)

        return err ? reject(err) : resolve()
      })
    })
  }
}

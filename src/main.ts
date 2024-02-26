import {GitAdapter} from './git'
import {readParams} from './input'
import {YeomanRunner} from './yeoman'
import {GithubAdapter} from './github'
import * as core from '@actions/core'

async function run(): Promise<void> {
  try {
    const params = readParams()
    const git = new GitAdapter(params)
    const yo = new YeomanRunner(params)
    const github = new GithubAdapter(params)

    core.info(`Running yeoman in ${params.cwd}`)
    process.chdir(params.cwd)

    core.info(`Instaling generator package`)
    await yo.installDependencies()
    core.info(`Packages instaled`)

    core.info(`Running generator`)
    await yo.run()
    core.info(`Generator done`)

    core.info(`Adding files to git`)
    await git.addFiles()
    core.info(`Files added`)

    core.info(`Ignoring untracked files`)
    await git.revertUntrackedFiles()
    core.info(`Ignore complete`)

    core.info(`Figuring out if files changed`)
    const filesChanged = await git.diffFiles()
    const changed = filesChanged.length > 0
    core.info(`Files changed : ${filesChanged}`)

    core.setOutput('changed', changed)
    core.setOutput('filesChanged', filesChanged)

    if (!changed) {
      core.info(`Found no changes`)
      return
    }

    await git.diffSummary()

    await git.configure()
    await git.createBranch()
    await git.commitChanges()
    await git.pushGithubPrBranch()
    await github.openPullRequest()
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error)

      throw error
    }

    core.setFailed(`Failed to run generator : ${error}`)
    throw error
  }
}

run()

import {Params} from './input'
import {GitHub} from '@actions/github/lib/utils'

import * as core from '@actions/core'
import {context, getOctokit} from '@actions/github'

/* eslint-disable import/named */
// see https://github.com/octokit/rest.js/issues/35
import {RestEndpointMethodTypes} from '@octokit/plugin-rest-endpoint-methods'
/* eslint-enable import/named */

type ListPullsResponse = RestEndpointMethodTypes['pulls']['list']['response']
type CreatePullResponse = RestEndpointMethodTypes['pulls']['create']['response']

type ListPullsParameters = RestEndpointMethodTypes['pulls']['list']['parameters']
type CreatePullParameters = RestEndpointMethodTypes['pulls']['create']['parameters']

type CreatePullDataResponse = CreatePullResponse['data']
type ListPullsDataItemResponse = ListPullsResponse['data'][0]

function refBase(): string {
  return context.ref.split('/').slice(2).join('/')
}

export class GithubAdapter {
  params: Params
  octokit: InstanceType<typeof GitHub>

  constructor(params: Params, octokit: InstanceType<typeof GitHub> | undefined = undefined) {
    this.params = params
    this.octokit = octokit || getOctokit(params.githubToken)
  }

  async findOpenPull(): Promise<ListPullsDataItemResponse> {
    const base = refBase()
    const head = this.params.githubPrBranch
    const params: ListPullsParameters = {
      ...context.repo,
      state: 'open',
      head,
      base
    }

    core.info(`Trying to find existing pr using : ${JSON.stringify(params)}`)

    const result: ListPullsResponse = await this.octokit.rest.pulls.list(params)
    const pull = result.data.find(d => d.head.ref === head && d.base.ref === base) as ListPullsDataItemResponse

    return pull
  }

  async createPull(): Promise<CreatePullDataResponse> {
    const base = refBase()
    const body = this.params.githubPrBody
    const title = this.params.githubPrBody
    const head = this.params.githubPrBranch
    const params: CreatePullParameters = {
      ...context.repo,
      base,
      body,
      title,
      head
    }

    core.info(`Creating new pr using : ${JSON.stringify(params)}`)

    const result: CreatePullResponse = await this.octokit.rest.pulls.create(params)
    const data: CreatePullDataResponse = result.data

    return data
  }

  async openPullRequest(): Promise<number> {
    const existing = await this.findOpenPull()

    if (existing) {
      core.info(`Skiping new pull request, Found ${existing.html_url}`)

      return Promise.resolve(existing.id)
    }

    const newPull = await this.createPull()

    core.info(`Created new pull request ${newPull.html_url}`)

    return Promise.resolve(newPull.id)
  }
}

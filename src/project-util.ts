import axios from './axios-handler'
import * as core from '@actions/core'
import type {AxiosResponse} from 'axios'
import {lstat, readdir} from 'fs/promises'
import {readFileSync} from 'fs'
import path from 'path'
import FormData from 'form-data'

export async function uploadFiles(directory: string): Promise<string> {
  core.debug(`currently in dir ${directory}`)
  const files = await readdir(directory)
  const form_data = new FormData()
  for (const file of files) {
    const file_path = path.join(directory, file)
    const stat = await lstat(file_path)
    if (stat.isFile()) {
      const fileSync = readFileSync(file_path, 'utf-8')
      //const fileStream = createReadStream(file_path, 'utf-8')
      form_data.append('files[]', fileSync, file)
      //form_data.append('[files]', fileStream))
    }
  }
  core.debug(`number of results is ${files.length}`)
  const resp: AxiosResponse = await axios.post(
    `${global.allure_server}/allure-docker-service/send-results?project_id=${global.project_id}&force_project_creation=true`,
    form_data,
    {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }
  )
  core.debug(`upload response status is: ${resp.status}`)
  core.debug(JSON.stringify(resp.data, null, 4))
  if (resp.status === 200) core.debug(`meta: ${resp.data['meta_data'].message}`)
  return directory
}

export async function generateReport(): Promise<string> {
  core.debug(`currently processing ${global.project_id} - generateReport`)
  const execution_name = encodeURIComponent(
    `${global.project_id} #${global.github_run_num}`
  )

  const execution_from = encodeURIComponent(
    `${global.github_server_url}/${global.github_repository}/actions/runs/${global.github_run_id}`
  )
  const execution_type = 'github'

  const url = `${global.allure_server}/allure-docker-service/generate-report?project_id=${global.project_id}&execution_name=${execution_name}&execution_from=${execution_from}&execution_type=${execution_type}`
  try {
    const resp: AxiosResponse = await axios.get(url)
    core.debug(`generate response status is: ${resp.status}`)
    if (resp.status === 200)
      core.debug(`meta: ${resp.data['meta_data'].message}`)
    core.debug(`report url is ${resp.data.data.report_url}`)
    return resp.data.data.report_url
  } catch (error: unknown) {
    if (error instanceof Error) {
      core.setFailed(error.message)
      return `error: ${error}`
    } else {
      core.error(`error: ${error}`)
      return `error: ${error}`
    }
  }
}

export interface Results {
  results?: ResultEntity[] | null
}
export interface ResultEntity {
  content_base64: string
  file_name: string
}

/*export async function create(): Promise<string> {
  try {
    const resp: AxiosResponse = await axios.post(
      `${global.allure_server}/allure-docker-service/projects`,
      {id: global.project_id}
    )
    core.debug(
      `response status is: ${resp.statusText} meta: ${resp.data['meta_data'].message} | return: ${resp.status}|${resp.data['meta_data'].message}`
    )

    return `${resp.status}|${resp.data['meta_data'].message}`
  } catch (error: unknown) {
    if (error instanceof Error) {
      core.setFailed(error.message)
      return `error: ${error}`
    } else {
      core.error(`error: ${error}`)
      return `error: ${error}`
    }
  }
}*/
/*export async function uploadResults(directory: string): Promise<string> {
  core.debug(`currently in dir ${directory}`)
  const files = await readdir(directory)
  const results: ResultEntity[] = []
  for (const file of files) {
    const file_path = path.join(directory, file)
    const stat = await lstat(file_path)
    if (stat.isFile()) {
      const fileSync = readFileSync(file_path, 'utf-8')
      const encoded = Buffer.from(fileSync).toString('base64')
      const decoded = Buffer.from(encoded).toString('utf-8')
      const resultEntity: ResultEntity = {
        file_name: file,
        content_base64: decoded
      }
      results.push(resultEntity)
    }
  }
  const results_json: Results = {results}
  core.debug(`number of results is ${results.length}`)
  try {
    const resp: AxiosResponse = await axios.post(
      `${global.allure_server}/allure-docker-service/send-results?project_id=${global.project_id}&force_project_creation=true`, //@TODO make project creation configurable
      JSON.stringify(results_json),
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
    core.debug(`upload response status is: ${resp.status}`)
    core.debug(JSON.stringify(resp.data, null, 4))
    if (resp.status === 200)
      core.debug(`meta: ${resp.data['meta_data'].message}`)
    return directory
  } catch (error: unknown) {
    if (error instanceof Error) {
      core.setFailed(error.message)
      return `error: ${error}`
    } else {
      core.error(`error: ${error}`)
      return `error: ${error}`
    }
  }
}*/

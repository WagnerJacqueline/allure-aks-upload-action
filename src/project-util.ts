import axios from './axios-handler'
import * as core from '@actions/core'
import {AxiosResponse} from 'axios'
import {readdir, lstat} from 'fs/promises'
import {readFileSync} from 'fs'
import path from 'path'

export async function create(name: string): Promise<string> {
  if (global.project_id === 'not_set') {
    global.project_id = name // + @TODO github action repo name
  }

  try {
    const resp: AxiosResponse = await axios.post(
      `${global.allure_server}/allure-docker-service/projects`,
      {id: global.project_id}
    )
    core.debug(
      `response status is: ${resp.statusText} meta: ${resp.data['meta_data'].message} | return: ${resp.status}|${resp.data['meta_data'].message}`
    )

    return `${resp.status}|${resp.data['meta_data'].message}`
  } catch (error) {
    return `An unexpected error occurred: ${error}`
  }
}
export async function uploadResults(directory: string): Promise<string> {
  const files = await readdir(directory)
  const results: ResultEntity[] = []
  for (const file of files) {
    const file_path = path.join(global.results_directory, file)
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
  await axios.post(
    `${global.allure_server}/allure-docker-service/send-results?project_id=${global.project_id}&force_project_creation=true`, //@TODO make project creation configurable
    JSON.stringify(results_json),
    {
      headers: {
        'Content-Type': 'application/json'
      }
    }
  )
  return directory
}
/*export async function uploadFiles(directory: string): Promise<string> {
  const files = await readdir(directory)
  const form_data = new FormData()
  for (const file of files) {
    const file_path = path.join(global.results_directory, file)
    const stat = await lstat(file_path)
    if (stat.isFile()) {
      const fileSync = readFileSync(file_path, 'utf-8')
      //const fileStream = createReadStream(file_path, 'utf-8')
      form_data.append('[files]', fileSync, file)
      //form_data.append('[files]', fileStream))
    }
  }
  await axios.post(
    `${global.allure_server}/allure-docker-service/send-results?project_id=${global.project_id}`,
    form_data,
    {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }
  )
  return directory
}*/

export async function generateReport(): Promise<string> {
  try {
    const resp: AxiosResponse = await axios.get(
      `${global.allure_server}/allure-docker-service/generate-report?project_id=${global.project_id}`
    )
    return resp.statusText
  } catch (error) {
    return `An unexpected error occurred: ${error}`
  }
}

export interface Results {
  results?: ResultEntity[] | null
}
export interface ResultEntity {
  content_base64: string
  file_name: string
}

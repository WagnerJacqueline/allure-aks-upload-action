import * as core from '@actions/core'
import {authenticate} from './authenticate'
import path from 'path'

export async function prepareGH(): Promise<void> {
  global.github_server_url = process.env.GITHUB_SERVER_URL as string
  core.info(`github_server_url is: ${global.github_server_url}`)

  global.github_repository = process.env.GITHUB_REPOSITORY as string
  core.info(`github_repository is: ${global.github_repository}`)

  global.github_repository_owner = process.env.GITHUB_REPOSITORY_OWNER as string
  core.info(`github_repository_owner is: ${global.github_repository_owner}`)

  global.github_run_num = process.env.GITHUB_RUN_NUMBER as string
  core.info(`github_run_num is: ${global.github_run_num}`)

  global.github_run_id = process.env.GITHUB_RUN_ID as string
  core.info(`github_run_id is: ${global.github_run_id}`)

  global.allure_results_directory = core.getInput('allure_results_directory')
  core.info(`allure_results_directory is: ${global.allure_results_directory}`)

  global.allure_server = core.getInput('allure_server')
  core.info(`allure_server is: ${global.allure_server}`)

  global.project_id = core.getInput('project_id')
  core.info(`project_id is: ${global.project_id}`)

  global.security_user = core.getInput('allure_user')
  core.info(`allure_user is: ${global.security_user}`)

  global.security_password = core.getInput('allure_password')
  core.debug(`password is: ${global.security_password}`)

  const temp_token = await authenticate()
  if (temp_token !== undefined) {
    global.csrf_access_token = temp_token.split(';').at(0) || 'undefined'
  } else global.csrf_access_token = 'undefined'

  global.results_directory = global.allure_results_directory
}

export async function prepareLocal(): Promise<void> {
  global.github_server_url = 'https://test-github.com'
  core.info(`github_server_url is: ${global.github_server_url}`)

  global.github_repository = 'DedalusTestDIIT/presentation-dicom'
  core.info(`github_repository is: ${global.github_repository}`)

  global.github_repository_owner = 'DedalusTestDIIT'
  core.info(`github_repository_owner is: ${global.github_repository_owner}`)

  global.github_run_num = '3135'
  core.info(`github_run_num is: ${global.github_run_num}`)

  global.github_run_id = '3460256272'
  core.info(`github_run_id is: ${global.github_run_id}`)

  global.allure_results_directory = 'allure-results-p/3'
  core.info(`allure_results_directory is: ${global.allure_results_directory}`)

  global.allure_server = 'http://10.90.2.5:6060/allure-api'
  core.info(`allure_server is: ${global.allure_server}`)

  //global.project_id = 'test-custom-local-ts'
  global.project_id = 'not-set'
  core.info(`project_id is: ${global.project_id}`)

  global.security_user = 'allure_admin'
  core.info(`allure_user is: ${global.security_user}`)

  global.security_password = 'Admin#9364'
  core.debug(`password is: ${global.security_password}`)
  const temp_token = await authenticate()
  if (temp_token !== undefined) {
    global.csrf_access_token = temp_token.split(';').at(0) || 'undefined'
  } else global.csrf_access_token = 'undefined'

  global.workspace = __dirname

  global.results_directory = path.join(
    global.workspace,
    global.allure_results_directory
  )
}

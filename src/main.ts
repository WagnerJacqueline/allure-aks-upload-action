import * as core from '@actions/core'
import {readdirSync, Dirent} from 'fs'
import path from 'path'
import {generateReport, uploadResults} from './project-util'
import {authenticate} from './authenticate'

async function run(): Promise<void> {
  try {
    global.github_server_url = process.env.GITHUB_SERVER_URL as string
    // global.github_server_url = 'https://test-github.com'
    core.info(`github_server_url is: ${global.github_server_url}`)
    global.github_repository = process.env.GITHUB_REPOSITORY as string
    // global.github_repository = 'DedalusTestDIIT/test-dicom'
    core.info(`github_repository is: ${global.github_repository}`)
    global.github_repository_owner = process.env
      .GITHUB_REPOSITORY_OWNER as string
    // global.github_repository_owner = 'DedalusTestDIIT'
    core.info(`github_repository_owner is: ${global.github_repository_owner}`)
    global.github_run_num = process.env.GITHUB_RUN_NUMBER as string
    // global.github_run_num = '12345'
    core.info(`github_run_num is: ${global.github_run_num}`)
    global.github_run_id = process.env.GITHUB_RUN_ID as string
    // global.github_run_id = '98765'
    core.info(`github_run_id is: ${global.github_run_id}`)
    global.allure_results_directory = core.getInput('allure_results_directory')
    // global.allure_results_directory = 'allure-results'
    core.info(`allure_results_directory is: ${global.allure_results_directory}`)
    global.allure_server = core.getInput('allure_server')
    // global.allure_server = 'http://10.90.2.5:6060/allure-api'
    core.info(`allure_server is: ${global.allure_server}`)
    global.project_id = core.getInput('project_id')
    // global.project_id = 'test-custom-local-ts'
    // global.project_id = 'not-set'
    core.info(`project_id is: ${global.project_id}`)
    global.security_user = core.getInput('allure_user')
    // global.security_user = 'allure_admin'
    core.info(`allure_user is: ${global.security_user}`)
    global.security_password = core.getInput('allure_password')
    // global.security_password = 'Admin#9364'
    core.debug(`password is: ${global.security_password}`)
    const temp_token = await authenticate()
    if (temp_token !== undefined) {
      global.csrf_access_token = temp_token.split(';').at(0) || 'undefined'
    } else global.csrf_access_token = 'undefined'

    // global.workspace = `${path.sep}github${path.sep}workspace`
    // global.workspace = __dirname

    /*global.results_directory = path.join(
      global.workspace,
      global.allure_results_directory
    )*/
    global.results_directory = global.allure_results_directory

    const directoriesInDirectory = readdirSync(global.results_directory, {
      withFileTypes: true
    })
      .filter((item: Dirent) => item.isDirectory())
      .map(item => item.name)

    core.debug(`# of dirs is: ${directoriesInDirectory.length}`)

    const repo = global.github_repository.split('/').at(1)
    let report_url = ' '

    if (directoriesInDirectory.length > 0) {
      for (const dir of directoriesInDirectory) {
        global.project_id = `${repo}-${dir}`
        await uploadResults(path.join(global.results_directory, dir))
        report_url = `${report_url + (await generateReport())} - ${dir}| `
      }
    } else {
      if (global.project_id === 'not-set') {
        global.project_id = `${repo}`
      }
      await uploadResults(global.results_directory)
      report_url = await generateReport()
    }
    core.setOutput('report_url', report_url)
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
    else core.error(`error: ${error}`)
  }
}

run()

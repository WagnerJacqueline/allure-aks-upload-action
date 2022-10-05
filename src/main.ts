import * as core from '@actions/core'
import {readdirSync, Dirent} from 'fs'
import path from 'path'
import {generateReport, uploadResults} from './project-util'
import {authenticate} from './authenticate'

async function run(): Promise<void> {
  try {
    // global.github_repository = core.getInput('GITHUB_REPOSITORY')
    global.github_repository = 'DedalusTestDIIT/test-dicom'
    // global.github_repository_owner = core.getInput('GITHUB_REPOSITORY_OWNER')
    global.github_repository_owner = 'DedalusTestDIIT'
    // global.github_run_num = core.getInput('GITHUB_RUN_NUMBER')
    global.github_run_num = '12345'
    // global.github_run_id = core.getInput('GITHUB_RUN_ID')
    global.github_run_id = '98765'
    //global.allure_results_directory = core.getInput('INPUT_ALLURE_RESULTS_DIRECTORY')
    global.allure_results_directory = 'allure-results-alone'
    // global.allure_server = core.getInput('INPUT_ALLURE_SERVER')
    global.allure_server = 'http://10.90.2.5:6060/allure-api'
    // global.project_id = core.getInput('INPUT_PROJECT_ID')
    global.project_id = 'test-custom-local-ts'

    // global.security_user = core.getInput('INPUT_ALLURE_USER')
    global.security_user = 'allure_admin'
    // global.security_password = core.getInput('INPUT_ALLURE_PASSWORD')
    global.security_password = ''
    const temp_token = await authenticate()
    if (temp_token !== undefined) {
      global.csrf_access_token = temp_token.split(';').at(0) || 'undefined'
    } else global.csrf_access_token = 'undefined'

    //global.workspace = `${path.sep}github${path.sep}workspace`
    global.workspace = __dirname

    global.results_directory = path.join(
      global.workspace,
      global.allure_results_directory
    )

    const directoriesInDirectory = readdirSync(global.results_directory, {
      withFileTypes: true
    })
      .filter((item: Dirent) => item.isDirectory())
      .map(item => item.name)

    core.debug(`# of dirs is: ${directoriesInDirectory.length}`)

    if (directoriesInDirectory.length > 0) {
      for (const dir of directoriesInDirectory) {
        //await create(dir.toString())
        await uploadResults(dir)
      }
    } else {
      //await create(global.results_directory.toString())
      await uploadResults(global.results_directory)
      await generateReport()
    }

    core.setOutput('report_url', new Date().toTimeString())
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()

import * as core from '@actions/core'
import {readdirSync, Dirent} from 'fs'
import path from 'path'
import {generateReport, uploadResults} from './project-util'
import {prepareGH} from './prepare'

async function run(): Promise<void> {
  try {
    await prepareGH()
    //await prepareLocal()
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
        report_url = `${dir}-${report_url + (await generateReport())}|\n`
      }
    } else {
      if (global.project_id === 'not-set') {
        global.project_id = `${repo}`
      }
      await uploadResults(global.results_directory)
      report_url = await generateReport()
    }
    core.setOutput('report_url', report_url)
  } catch (error: unknown) {
    if (error instanceof Error) core.setFailed(error.message)
    else core.error(`error: ${error}`)
  }
}

run()

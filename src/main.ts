import * as core from '@actions/core'
import {readdirSync, Dirent} from 'fs'
import path from 'path'
import {generateReport, uploadFiles} from './project-util'
import {prepareGH} from './prepare'
import {SummaryTableRow} from '@actions/core/lib/summary'

async function run(): Promise<void> {
  try {
    await prepareGH()
    //await prepareLocal()
    const directoriesInDirectory = readdirSync(global.results_directory, {
      withFileTypes: true
    })
      .filter((item: Dirent) => item.isDirectory())
      .map(item => item.name)

    core.info(`# of dirs is: ${directoriesInDirectory.length}`)

    const repo = global.github_repository.split('/').at(1)
    let report_url = '\n'

    const rows: SummaryTableRow[] = [
      [
        {data: 'Name', header: true},
        {data: 'URL', header: true}
      ]
    ]

    if (directoriesInDirectory.length > 0) {
      for (const dir of directoriesInDirectory) {
        const row: SummaryTableRow = []
        global.project_id = `${repo}-${dir}`
        await uploadFiles(path.join(global.results_directory, dir))
        core.debug(`finished upload of ${dir}`)
        const generatedUrl = await generateReport()
        report_url = `${report_url}${dir}: ${generatedUrl}\n`
        row.push(dir, `[${generatedUrl}](${generatedUrl})`)
        rows.push(row)
      }
      await core.summary.addHeading('Allure Report URLs').addTable(rows).write()
    } else {
      if (global.project_id === 'not-set') {
        global.project_id = `${repo}`
      }
      await uploadFiles(global.results_directory)
      report_url = await generateReport()
    }
    core.setOutput('report_url', report_url)
  } catch (error: unknown) {
    if (error instanceof Error) core.setFailed(error.message)
    else core.error(`error: ${error}`)
  }
}

run()

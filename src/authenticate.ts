import axios from './axios-handler'
import * as core from '@actions/core'

type Authentication = {
  access_token: string
  expires_in: number
  refresh_token: string
  roles: string[]
}

type Headers = {
  set_cookie: string[]
}

export type AuthenticationResponse = {
  data: Authentication
  headers: Headers
}

export async function authenticate(): Promise<string | undefined> {
  core.debug(`start authenticate`)
  try {
    const {data, headers, status} = await axios.post<AuthenticationResponse>(
      `${global.allure_server}/allure-docker-service/login`,
      {username: global.security_user, password: global.security_password}
    )

    //core.debug(JSON.stringify(data, null, 4))
    //core.debug(JSON.stringify(headers, null, 4))

    core.debug(`authentication response status is: ${status}`)
    if (status === 200) core.debug(`access token is: ${data.data.access_token}`)
    global.csrf_access_token_cookie = headers['set-cookie']?.at(0) as string
    return headers['set-cookie']
      ?.filter(e => e.toString().includes('csrf_access_token'))
      .at(0)
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

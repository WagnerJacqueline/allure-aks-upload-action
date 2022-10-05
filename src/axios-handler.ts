import axios, {AxiosRequestConfig} from 'axios'

const instance = axios.create({
  baseURL: global.allure_server
})

instance.interceptors.request.use(
  function (config: AxiosRequestConfig) {
    config.withCredentials = true
    const headers = config.headers
    if (
      (global.csrf_access_token !== undefined && !!headers) ||
      !headers ||
      headers['X-CSRF-TOKEN']
    ) {
      const csrf = global.csrf_access_token.split('=').at(1) as string
      if (csrf) {
        if (headers) {
          headers['X-CSRF-TOKEN'] = csrf
        }
      }
    }
    if (global.csrf_access_token_cookie !== undefined)
      if (headers) {
        headers['Cookie'] = global.csrf_access_token_cookie
      }
    config.xsrfCookieName = 'X-CSRF-TOKEN'
    config.maxBodyLength = Infinity
    return config
  },
  async function (error) {
    return Promise.reject(error)
  }
)

instance.interceptors.response.use(response => {
  return response
})

instance.interceptors.response.use(undefined, async error => {
  return error
})

export default instance

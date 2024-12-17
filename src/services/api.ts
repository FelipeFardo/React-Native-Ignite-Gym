import { AppError } from '@utils/AppError'
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://192.168.0.84:3333',
})

api.interceptors.request.use(async(request)=> {
  await sleep(2000);
  return request
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.data) {
      return Promise.reject(new AppError(error.response.data.message))
    }
    return Promise.reject(error)
  },
)

function sleep(ms:number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export { api }

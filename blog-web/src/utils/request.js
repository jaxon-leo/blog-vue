import axios from 'axios'
import { Message } from 'element-ui'
import { getToken, removeToken } from '@/utils/cookie'
import store from '@/store'
import router from '@/router'

const service = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_API,
  timeout: 10000
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    const token = getToken()
    if (token) {
      config.headers['Authorization'] = token
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  response => {
    const res = response.data
    if (res.code === 200) {
      return res
    }
    if (res.code === 404) {
      Message.error('请求路径不存在')
      return Promise.reject(new Error('请求路径不存在'))
    }
    if (res.code === 401) {
      Message.warning(res.message || '当前登录已过期，请重新登录')
      removeToken()
      store.commit('SET_USER_INFO', null)
      router.push('/login')
      return Promise.reject(new Error(res.message || '当前登录已过期，请重新登录'))
    }
    Message.error(res.message || '请求失败')
    return Promise.reject(new Error(res.message || '请求失败'))
  },
  error => {
    const msg = error.response?.data?.message || error.message || '网络异常，请稍后重试'
    Message.error(msg)
    if (error.response?.status === 401) {
      removeToken()
      store.commit('SET_USER_INFO', null)
      router.push('/login')
    }
    return Promise.reject(error)
  }
)

export default service
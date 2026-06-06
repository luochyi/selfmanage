import Taro from '@tarojs/taro'
import config from '../config'

const BASE_URL = config.baseUrl

interface RequestOptions {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: any
  header?: Record<string, string>
}

interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

export const request = <T = any>(options: RequestOptions): Promise<ApiResponse<T>> => {
  return new Promise((resolve, reject) => {
    const token = Taro.getStorageSync('token')
    
    const header: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.header,
    }
    
    if (token) {
      header['Authorization'] = `Bearer ${token}`
    }
    
    Taro.request({
      url: `${BASE_URL}${options.url}`,
      method: options.method || 'GET',
      data: options.data,
      header,
      success: (res) => {
        if (res.statusCode === 401) {
          // Token 过期，跳转登录
          Taro.removeStorageSync('token')
          Taro.removeStorageSync('user')
          Taro.switchTab({ url: '/pages/profile/index' })
          reject(new Error('请先登录'))
          return
        }
        
        const data = res.data as ApiResponse<T>
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(data)
        } else {
          // NestJS validation errors return message as array
          const errorMsg = Array.isArray(data.message) 
            ? data.message.join('; ') 
            : (data.message || '请求失败')
          Taro.showToast({
            title: errorMsg,
            icon: 'none',
          })
          reject(new Error(errorMsg))
        }
      },
      fail: (err) => {
        Taro.showToast({
          title: '网络错误',
          icon: 'none',
        })
        reject(err)
      },
    })
  })
}

export const get = <T = any>(url: string, data?: any) => {
  return request<T>({ url, method: 'GET', data })
}

export const post = <T = any>(url: string, data?: any) => {
  return request<T>({ url, method: 'POST', data })
}

export const put = <T = any>(url: string, data?: any) => {
  return request<T>({ url, method: 'PUT', data })
}

export const del = <T = any>(url: string, data?: any) => {
  return request<T>({ url, method: 'DELETE', data })
}
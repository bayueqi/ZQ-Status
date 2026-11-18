/**
 * 管理接口请求
 * 密码只保存在当前会话，关闭标签页后失效
 */

import axios from 'axios'

const ADMIN_URL = import.meta.env.VITE_UPTIMEROBOT_ADMIN_URL || '/api/admin'
const STORAGE_KEY = 'zq_status_admin'

export const getAdminPassword = () => sessionStorage.getItem(STORAGE_KEY) || ''

const setAdminPassword = (password) => {
  if (password) {
    sessionStorage.setItem(STORAGE_KEY, password)
  } else {
    sessionStorage.removeItem(STORAGE_KEY)
  }
}

export const isAdmin = () => Boolean(getAdminPassword())

export const clearAdmin = () => setAdminPassword('')

const post = async (payload) => {
  let data

  try {
    const response = await axios.post(ADMIN_URL, payload, { timeout: 15000 })
    data = response.data
  } catch (error) {
    const status = error.response?.status
    const message = error.response?.data?.error?.message

    if (status === 401) {
      clearAdmin()
      throw new Error(message || '密码错误')
    }

    throw new Error(message || error.message || '操作失败')
  }

  if (data?.stat !== 'ok') {
    throw new Error(data?.error?.message || '操作失败')
  }

  return data
}

/**
 * 校验管理密码
 * @param {string} password
 */
export const login = async (password) => {
  await post({ action: 'auth', password })
  setAdminPassword(password)
}

/**
 * 新增监控
 * @param {string} name
 * @param {string} url
 */
export const addMonitor = (name, url) =>
  post({ action: 'add', password: getAdminPassword(), name, url })

/**
 * 删除监控
 * @param {number} id
 */
export const removeMonitor = (id) =>
  post({ action: 'delete', password: getAdminPassword(), id })

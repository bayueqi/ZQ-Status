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
    const response = await axios.post(ADMIN_URL, payload, { timeout: 20000 })
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

/** 校验管理密码 */
export const login = async (password) => {
  await post({ action: 'auth', password })
  setAdminPassword(password)
}

/** 获取监控列表 */
export const fetchMonitors = async () => {
  const data = await post({ action: 'list', password: getAdminPassword() })
  return data.monitors || []
}

/** 新增监控 */
export const addMonitor = ({ name, url, interval }) =>
  post({ action: 'add', password: getAdminPassword(), name, url, interval })

/** 修改监控 */
export const updateMonitor = ({ id, name, url, interval }) =>
  post({ action: 'update', password: getAdminPassword(), id, name, url, interval })

/** 暂停或恢复监控 */
export const setMonitorStatus = ({ id, status }) =>
  post({ action: 'status', password: getAdminPassword(), id, status })

/** 删除监控 */
export const removeMonitor = (id) =>
  post({ action: 'delete', password: getAdminPassword(), id })

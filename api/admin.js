/**
 * 监控管理接口（Vercel）
 * 用于查询、新增、修改、暂停、删除 UptimeRobot 监控，需要账号级（读写）API Key
 *
 * 环境变量：
 * - UPTIMEROBOT_MAIN_API_KEY：账号级 Main API key
 * - ADMIN_PASSWORD：管理密码
 */

const API_BASE = 'https://api.uptimerobot.com/v2'

const fail = (res, message, status = 200) =>
  res.status(status).json({ stat: 'fail', error: { message } })

const callApi = async (method, payload) => {
  const response = await fetch(`${API_BASE}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  return response.json()
}

const normalizeUrl = (url) => (/^https?:\/\//i.test(url) ? url : `http://${url}`)

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return fail(res, '只支持 POST 请求', 405)
  }

  const adminPassword = process.env.ADMIN_PASSWORD
  const apiKey = process.env.UPTIMEROBOT_MAIN_API_KEY

  if (!adminPassword || !apiKey) {
    return fail(res, '服务端未配置 ADMIN_PASSWORD 或 UPTIMEROBOT_MAIN_API_KEY', 500)
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body

  if (String(body?.password ?? '') !== String(adminPassword)) {
    return fail(res, '密码错误', 401)
  }

  try {
    switch (body?.action) {
      case 'auth':
        return res.status(200).json({ stat: 'ok' })
      case 'list':
        return await listMonitors(res, apiKey)
      case 'add':
        return await addMonitor(res, apiKey, body)
      case 'update':
        return await updateMonitor(res, apiKey, body)
      case 'status':
        return await setMonitorStatus(res, apiKey, body)
      case 'delete':
        return await deleteMonitor(res, apiKey, body)
      default:
        return fail(res, '未知操作', 400)
    }
  } catch (error) {
    return fail(res, '请求 UptimeRobot 失败')
  }
}

async function listMonitors(res, apiKey) {
  const data = await callApi('getMonitors', {
    api_key: apiKey,
    format: 'json'
  })

  if (data?.stat !== 'ok') {
    return fail(res, data?.error?.message || '获取监控列表失败')
  }

  const monitors = (data.monitors || []).map((monitor) => ({
    id: monitor.id,
    friendly_name: monitor.friendly_name,
    url: monitor.url,
    type: monitor.type,
    status: monitor.status,
    interval: monitor.interval
  }))

  return res.status(200).json({ stat: 'ok', monitors })
}

async function addMonitor(res, apiKey, body) {
  const name = String(body.name ?? '').trim()
  const url = String(body.url ?? '').trim()
  const interval = Number(body.interval) || 300

  if (!name || !url) {
    return fail(res, '名称和地址不能为空', 400)
  }

  if (!Number.isInteger(interval) || interval < 60) {
    return fail(res, '检测间隔无效', 400)
  }

  const data = await callApi('newMonitor', {
    api_key: apiKey,
    format: 'json',
    friendly_name: name,
    url: normalizeUrl(url),
    type: 1,
    interval
  })

  if (data?.stat !== 'ok') {
    return fail(res, data?.error?.message || '创建监控失败')
  }

  return res.status(200).json({ stat: 'ok', monitor: data.monitor })
}

async function updateMonitor(res, apiKey, body) {
  const id = Number(body.id)
  const name = String(body.name ?? '').trim()
  const url = String(body.url ?? '').trim()
  const interval = Number(body.interval)

  if (!Number.isInteger(id) || id <= 0) {
    return fail(res, '监控 ID 无效', 400)
  }

  if (!name || !url) {
    return fail(res, '名称和地址不能为空', 400)
  }

  if (!Number.isInteger(interval) || interval < 60) {
    return fail(res, '检测间隔无效', 400)
  }

  const data = await callApi('editMonitor', {
    api_key: apiKey,
    format: 'json',
    id,
    friendly_name: name,
    url: normalizeUrl(url),
    interval
  })

  if (data?.stat !== 'ok') {
    return fail(res, data?.error?.message || '保存失败')
  }

  return res.status(200).json({ stat: 'ok', monitor: data.monitor })
}

async function setMonitorStatus(res, apiKey, body) {
  const id = Number(body.id)
  const status = Number(body.status)

  if (!Number.isInteger(id) || id <= 0) {
    return fail(res, '监控 ID 无效', 400)
  }

  if (status !== 0 && status !== 1) {
    return fail(res, '状态无效', 400)
  }

  const data = await callApi('editMonitor', {
    api_key: apiKey,
    format: 'json',
    id,
    status
  })

  if (data?.stat !== 'ok') {
    return fail(res, data?.error?.message || '操作失败')
  }

  return res.status(200).json({ stat: 'ok', monitor: data.monitor })
}

async function deleteMonitor(res, apiKey, body) {
  const id = Number(body.id)

  if (!Number.isInteger(id) || id <= 0) {
    return fail(res, '监控 ID 无效', 400)
  }

  const data = await callApi('deleteMonitor', {
    api_key: apiKey,
    format: 'json',
    id
  })

  if (data?.stat !== 'ok') {
    return fail(res, data?.error?.message || '删除监控失败')
  }

  return res.status(200).json({ stat: 'ok', monitor: data.monitor })
}

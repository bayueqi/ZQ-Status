/**
 * 监控管理接口（Vercel）
 * 用于新增、删除 UptimeRobot 监控，需要账号级（读写）API Key
 *
 * 环境变量：
 * - UPTIMEROBOT_MAIN_API_KEY：账号级 Main API key
 * - ADMIN_PASSWORD：管理密码
 */

const API_BASE = 'https://api.uptimerobot.com/v2'

const fail = (res, message, status = 200) =>
  res.status(status).json({ stat: 'fail', error: { message } })

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
      case 'add':
        return await addMonitor(res, apiKey, body)
      case 'delete':
        return await deleteMonitor(res, apiKey, body)
      default:
        return fail(res, '未知操作', 400)
    }
  } catch (error) {
    return fail(res, '请求 UptimeRobot 失败')
  }
}

async function addMonitor(res, apiKey, body) {
  const name = String(body.name ?? '').trim()
  const url = String(body.url ?? '').trim()

  if (!name || !url) {
    return fail(res, '名称和地址不能为空', 400)
  }

  const target = /^https?:\/\//i.test(url) ? url : `http://${url}`

  const response = await fetch(`${API_BASE}/newMonitor`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: apiKey,
      format: 'json',
      friendly_name: name,
      url: target,
      type: 1,
      interval: 300
    })
  })

  const data = await response.json()

  if (data?.stat !== 'ok') {
    return fail(res, data?.error?.message || '创建监控失败')
  }

  return res.status(200).json({ stat: 'ok', monitor: data.monitor })
}

async function deleteMonitor(res, apiKey, body) {
  const id = Number(body.id)

  if (!Number.isInteger(id) || id <= 0) {
    return fail(res, '监控 ID 无效', 400)
  }

  const response = await fetch(`${API_BASE}/deleteMonitor`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: apiKey,
      format: 'json',
      id
    })
  })

  const data = await response.json()

  if (data?.stat !== 'ok') {
    return fail(res, data?.error?.message || '删除监控失败')
  }

  return res.status(200).json({ stat: 'ok', monitor: data.monitor })
}

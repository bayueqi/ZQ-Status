/**
 * 监控管理接口
 * 用于新增、删除 UptimeRobot 监控，需要账号级（读写）API Key
 *
 * 环境变量：
 * - UPTIMEROBOT_MAIN_API_KEY：账号级 Main API key
 * - ADMIN_PASSWORD：管理密码
 */

const API_BASE = 'https://api.uptimerobot.com/v2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
}

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })

const fail = (message, status = 200) =>
  json({ stat: 'fail', error: { message } }, status)

export async function onRequest(context) {
  if (context.request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (context.request.method !== 'POST') {
    return fail('只支持 POST 请求', 405)
  }

  const env = context.env || (typeof process !== 'undefined' ? process.env : {}) || {}
  const adminPassword = env.ADMIN_PASSWORD
  const apiKey = env.UPTIMEROBOT_MAIN_API_KEY

  if (!adminPassword || !apiKey) {
    return fail('服务端未配置 ADMIN_PASSWORD 或 UPTIMEROBOT_MAIN_API_KEY', 500)
  }

  let body
  try {
    body = await context.request.json()
  } catch (error) {
    return fail('请求格式错误', 400)
  }

  if (String(body?.password ?? '') !== String(adminPassword)) {
    return fail('密码错误', 401)
  }

  try {
    switch (body?.action) {
      case 'auth':
        return json({ stat: 'ok' })
      case 'add':
        return await addMonitor(apiKey, body)
      case 'delete':
        return await deleteMonitor(apiKey, body)
      default:
        return fail('未知操作', 400)
    }
  } catch (error) {
    return fail('请求 UptimeRobot 失败')
  }
}

async function addMonitor(apiKey, body) {
  const name = String(body.name ?? '').trim()
  const url = String(body.url ?? '').trim()

  if (!name || !url) {
    return fail('名称和地址不能为空', 400)
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
    return fail(data?.error?.message || '创建监控失败')
  }

  return json({ stat: 'ok', monitor: data.monitor })
}

async function deleteMonitor(apiKey, body) {
  const id = Number(body.id)

  if (!Number.isInteger(id) || id <= 0) {
    return fail('监控 ID 无效', 400)
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
    return fail(data?.error?.message || '删除监控失败')
  }

  return json({ stat: 'ok', monitor: data.monitor })
}

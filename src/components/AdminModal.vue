<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div class="absolute inset-0 bg-black/60" @click="close"></div>

      <div
        class="relative flex flex-col w-full max-w-2xl max-h-[85vh] rounded-2xl shadow-xl
          bg-white dark:bg-gray-800
          border border-gray-200 dark:border-gray-700"
      >
        <!-- 头部 -->
        <div class="flex items-center justify-between gap-3 px-5 py-4 border-b border-gray-100 dark:border-gray-700">
          <div class="flex items-center gap-2">
            <h3 class="text-lg font-bold text-gray-900 dark:text-gray-100">
              管理
            </h3>
            <span v-if="isAdmin && !loading" class="text-xs text-gray-400">
              {{ monitors.length }}
            </span>
          </div>

          <div class="flex items-center gap-1">
            <button
              v-if="isAdmin"
              @click="startAdd"
              class="flex items-center gap-1 px-3 h-8 rounded-full text-xs font-medium transition-colors duration-200
                bg-blue-50 dark:bg-blue-900/30
                text-blue-600 dark:text-blue-400
                hover:bg-blue-100 dark:hover:bg-blue-900/50"
            >
              <Icon icon="ph:plus-bold" class="w-3.5 h-3.5" />
              添加
            </button>
            <button
              v-if="isAdmin"
              @click="logout"
              class="px-3 h-8 rounded-full text-xs font-medium transition-colors duration-200
                text-gray-500 dark:text-gray-400
                hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              退出
            </button>
            <button
              @click="close"
              class="p-1 rounded-full transition-colors duration-200
                hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Icon icon="carbon:close" class="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </div>

        <!-- 未验证：密码 -->
        <form v-if="!isAdmin" @submit.prevent="submitLogin" class="p-5 space-y-4">
          <input
            v-model="password"
            type="password"
            placeholder="管理密码"
            autocomplete="current-password"
            class="w-full px-4 py-3 rounded-lg border-2 transition-all duration-200
              border-gray-200 dark:border-gray-600
              bg-gray-50 dark:bg-gray-700
              text-gray-900 dark:text-gray-100
              placeholder-gray-500 dark:placeholder-gray-400
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="submit"
            :disabled="loading || !password"
            class="w-full py-3 rounded-lg font-semibold text-sm text-white
              bg-gradient-to-r from-blue-500 to-cyan-400
              transition-opacity duration-200
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            进入
          </button>
          <p v-if="error" class="text-sm text-red-500 dark:text-red-400">{{ error }}</p>
        </form>

        <!-- 已验证：列表 -->
        <div v-else class="flex-1 overflow-y-auto p-4 space-y-2">
          <!-- 新增表单 -->
          <div
            v-if="adding"
            class="p-3 rounded-xl border-2 border-blue-200 dark:border-blue-800
              bg-blue-50/50 dark:bg-blue-900/10 space-y-2"
          >
            <input
              v-model="form.name"
              type="text"
              placeholder="网站名称"
              class="w-full px-3 py-2 rounded-lg border-2 transition-all duration-200
                border-gray-200 dark:border-gray-600
                bg-white dark:bg-gray-700
                text-gray-900 dark:text-gray-100
                placeholder-gray-500 dark:placeholder-gray-400
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              v-model="form.url"
              type="text"
              placeholder="https://example.com"
              class="w-full px-3 py-2 rounded-lg border-2 transition-all duration-200
                border-gray-200 dark:border-gray-600
                bg-white dark:bg-gray-700
                text-gray-900 dark:text-gray-100
                placeholder-gray-500 dark:placeholder-gray-400
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div class="flex items-center gap-2">
              <select
                v-model.number="form.interval"
                class="flex-1 px-3 py-2 rounded-lg border-2 transition-all duration-200
                  border-gray-200 dark:border-gray-600
                  bg-white dark:bg-gray-700
                  text-gray-900 dark:text-gray-100
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option v-for="item in intervalOptions" :key="item.value" :value="item.value">
                  {{ item.label }}
                </option>
              </select>
              <button
                @click="submitAdd"
                :disabled="loading || !form.name.trim() || !form.url.trim()"
                class="px-4 py-2 rounded-lg text-sm font-semibold text-white
                  bg-gradient-to-r from-blue-500 to-cyan-400
                  disabled:opacity-50 disabled:cursor-not-allowed"
              >
                添加
              </button>
              <button
                @click="cancelForm"
                class="px-4 py-2 rounded-lg text-sm font-medium
                  text-gray-600 dark:text-gray-300
                  hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                取消
              </button>
            </div>
          </div>

          <!-- 载入中 -->
          <div v-if="loading && !monitors.length" class="flex justify-center py-8">
            <Icon icon="ph:spinner" class="w-6 h-6 text-blue-500 animate-spin" />
          </div>

          <!-- 监控条目 -->
          <div
            v-for="monitor in monitors"
            :key="monitor.id"
            class="rounded-xl border border-gray-200 dark:border-gray-700
              bg-gray-50 dark:bg-gray-700/30"
          >
            <!-- 编辑态 -->
            <div v-if="editingId === monitor.id" class="p-3 space-y-2">
              <input
                v-model="form.name"
                type="text"
                placeholder="网站名称"
                class="w-full px-3 py-2 rounded-lg border-2 transition-all duration-200
                  border-gray-200 dark:border-gray-600
                  bg-white dark:bg-gray-700
                  text-gray-900 dark:text-gray-100
                  placeholder-gray-500 dark:placeholder-gray-400
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                v-model="form.url"
                type="text"
                placeholder="https://example.com"
                class="w-full px-3 py-2 rounded-lg border-2 transition-all duration-200
                  border-gray-200 dark:border-gray-600
                  bg-white dark:bg-gray-700
                  text-gray-900 dark:text-gray-100
                  placeholder-gray-500 dark:placeholder-gray-400
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div class="flex items-center gap-2">
                <select
                  v-model.number="form.interval"
                  class="flex-1 px-3 py-2 rounded-lg border-2 transition-all duration-200
                    border-gray-200 dark:border-gray-600
                    bg-white dark:bg-gray-700
                    text-gray-900 dark:text-gray-100
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option v-for="item in intervalOptionsFor(monitor)" :key="item.value" :value="item.value">
                    {{ item.label }}
                  </option>
                </select>
                <button
                  @click="submitEdit(monitor)"
                  :disabled="loading || !form.name.trim() || !form.url.trim()"
                  class="px-4 py-2 rounded-lg text-sm font-semibold text-white
                    bg-gradient-to-r from-blue-500 to-cyan-400
                    disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  保存
                </button>
                <button
                  @click="cancelForm"
                  class="px-4 py-2 rounded-lg text-sm font-medium
                    text-gray-600 dark:text-gray-300
                    hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  取消
                </button>
              </div>
            </div>

            <!-- 展示态 -->
            <div v-else class="flex items-center gap-3 px-3 py-2.5">
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2 min-w-0">
                  <span class="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {{ monitor.friendly_name }}
                  </span>
                  <span
                    class="shrink-0 px-2 py-0.5 rounded-full text-[11px] font-medium"
                    :class="statusClass(monitor.status)"
                  >
                    {{ statusText(monitor.status) }}
                  </span>
                </div>
                <div class="mt-0.5 flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                  <span class="truncate">{{ monitor.url }}</span>
                  <span class="shrink-0">·</span>
                  <span class="shrink-0">{{ intervalText(monitor.interval) }}</span>
                </div>
              </div>

              <div class="flex shrink-0 items-center gap-0.5">
                <button
                  @click="startEdit(monitor)"
                  class="p-1.5 rounded-full transition-colors duration-200
                    text-gray-400 hover:text-blue-500 hover:bg-blue-50
                    dark:text-gray-500 dark:hover:text-blue-400 dark:hover:bg-blue-900/30
                    box-content"
                >
                  <Icon icon="ph:pencil-simple" class="w-4 h-4" />
                </button>
                <button
                  @click="toggleStatus(monitor)"
                  class="p-1.5 rounded-full transition-colors duration-200
                    text-gray-400 hover:text-amber-500 hover:bg-amber-50
                    dark:text-gray-500 dark:hover:text-amber-400 dark:hover:bg-amber-900/30
                    box-content"
                >
                  <Icon
                    :icon="monitor.status === 0 ? 'ph:play' : 'ph:pause'"
                    class="w-4 h-4"
                  />
                </button>
                <button
                  @click="remove(monitor)"
                  class="p-1.5 rounded-full transition-colors duration-200
                    text-gray-400 hover:text-red-500 hover:bg-red-50
                    dark:text-gray-500 dark:hover:text-red-400 dark:hover:bg-red-900/30
                    box-content"
                >
                  <Icon icon="carbon:trash-can" class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <p v-if="error" class="px-1 text-sm text-red-500 dark:text-red-400">{{ error }}</p>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue'
import { Icon } from '@iconify/vue'
import {
  login,
  fetchMonitors,
  addMonitor,
  updateMonitor,
  setMonitorStatus,
  removeMonitor
} from '@/utils/admin'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  isAdmin: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'login', 'logout', 'changed'])

const INTERVAL_OPTIONS = [
  { value: 300, label: '5 分钟' },
  { value: 600, label: '10 分钟' },
  { value: 900, label: '15 分钟' },
  { value: 1800, label: '30 分钟' },
  { value: 3600, label: '60 分钟' }
]

const STATUS_MAP = {
  0: { text: '暂停', classes: 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400' },
  1: { text: '准备中', classes: 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400' },
  2: { text: '在线', classes: 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400' },
  8: { text: '异常', classes: 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400' },
  9: { text: '离线', classes: 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400' }
}

const password = ref('')
const monitors = ref([])
const loading = ref(false)
const error = ref('')
const adding = ref(false)
const editingId = ref(null)
const form = ref({ name: '', url: '', interval: 300 })

const intervalOptions = INTERVAL_OPTIONS

const intervalOptionsFor = (monitor) => {
  const known = INTERVAL_OPTIONS.some((item) => item.value === Number(monitor.interval))
  if (known) return INTERVAL_OPTIONS
  return [{ value: Number(monitor.interval), label: intervalText(monitor.interval) }, ...INTERVAL_OPTIONS]
}

const intervalText = (seconds) => {
  const value = Number(seconds) || 300
  const minutes = Math.round(value / 60)
  return `${minutes} 分钟`
}

const statusText = (status) => STATUS_MAP[status]?.text || '未知'
const statusClass = (status) => STATUS_MAP[status]?.classes || 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-300'

const close = () => emit('update:modelValue', false)

const resetForm = () => {
  form.value = { name: '', url: '', interval: 300 }
  adding.value = false
  editingId.value = null
}

const load = async () => {
  loading.value = true
  error.value = ''

  try {
    monitors.value = await fetchMonitors()
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

watch(
  () => [props.modelValue, props.isAdmin],
  ([open, admin]) => {
    if (open && admin) {
      resetForm()
      load()
    }
    if (!open) {
      password.value = ''
      error.value = ''
      resetForm()
    }
  },
  { immediate: true }
)

const submitLogin = async () => {
  if (loading.value) return
  loading.value = true
  error.value = ''

  try {
    await login(password.value)
    password.value = ''
    emit('login')
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

const startAdd = () => {
  editingId.value = null
  form.value = { name: '', url: '', interval: 300 }
  adding.value = true
  error.value = ''
}

const startEdit = (monitor) => {
  adding.value = false
  editingId.value = monitor.id
  form.value = {
    name: monitor.friendly_name,
    url: monitor.url,
    interval: Number(monitor.interval) || 300
  }
  error.value = ''
}

const cancelForm = () => resetForm()

const submitAdd = async () => {
  if (loading.value) return
  loading.value = true
  error.value = ''

  try {
    await addMonitor({
      name: form.value.name.trim(),
      url: form.value.url.trim(),
      interval: form.value.interval
    })
    resetForm()
    await load()
    emit('changed')
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

const submitEdit = async (monitor) => {
  if (loading.value) return
  loading.value = true
  error.value = ''

  try {
    await updateMonitor({
      id: monitor.id,
      name: form.value.name.trim(),
      url: form.value.url.trim(),
      interval: form.value.interval
    })
    resetForm()
    await load()
    emit('changed')
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

const toggleStatus = async (monitor) => {
  if (loading.value) return
  loading.value = true
  error.value = ''

  try {
    await setMonitorStatus({
      id: monitor.id,
      status: monitor.status === 0 ? 1 : 0
    })
    await load()
    emit('changed')
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

const remove = async (monitor) => {
  if (loading.value) return
  if (!window.confirm(`删除「${monitor.friendly_name}」？`)) return

  loading.value = true
  error.value = ''

  try {
    await removeMonitor(monitor.id)
    if (editingId.value === monitor.id) resetForm()
    await load()
    emit('changed')
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

const logout = () => {
  password.value = ''
  error.value = ''
  monitors.value = []
  resetForm()
  emit('logout')
}
</script>

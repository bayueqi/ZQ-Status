<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="close"></div>

      <div
        class="relative flex flex-col w-full max-w-2xl max-h-[85vh] rounded-2xl shadow-2xl animate-fade
          bg-white dark:bg-gray-800
          border border-gray-200/60 dark:border-gray-700/60"
      >
        <!-- 头部 -->
        <div class="flex items-center justify-between gap-3 px-6 py-4 border-b border-gray-200/60 dark:border-gray-700/60">
          <div class="flex items-center gap-2">
            <h3 class="text-lg font-bold text-gray-800 dark:text-gray-100">
              管理
            </h3>
            <span
              v-if="isAdmin && !loading"
              class="px-2 py-0.5 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300"
            >
              {{ monitors.length }}
            </span>
          </div>

          <div class="flex items-center gap-2">
            <button
              v-if="isAdmin"
              @click="startAdd"
              class="flex items-center gap-1.5 px-4 h-9 rounded-full
                text-sm font-semibold text-white
                bg-gradient-to-r from-blue-500 to-cyan-400
                shadow-md shadow-blue-500/20
                transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/30"
            >
              <Icon icon="ph:plus-bold" class="w-4 h-4" />
              添加
            </button>
            <button
              v-if="isAdmin"
              @click="logout"
              class="px-3 h-9 rounded-full text-sm font-medium transition-colors duration-200
                text-gray-500 dark:text-gray-400
                hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              退出
            </button>
            <button
              @click="close"
              class="flex items-center justify-center w-9 h-9 rounded-full transition-colors duration-200
                bg-gray-50 dark:bg-gray-700/50
                text-gray-500 dark:text-gray-400
                hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Icon icon="carbon:close" class="w-5 h-5" />
            </button>
          </div>
        </div>

        <!-- 未验证：密码 -->
        <form v-if="!isAdmin" @submit.prevent="submitLogin" class="p-6 space-y-4">
          <input
            v-model="password"
            type="password"
            placeholder="管理密码"
            autocomplete="current-password"
            class="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg
              bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100
              placeholder-gray-500 dark:placeholder-gray-400
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              transition-all duration-200"
          />
          <button
            type="submit"
            :disabled="loading || !password"
            class="w-full py-3 rounded-lg font-semibold text-sm text-white
              bg-gradient-to-r from-blue-500 to-cyan-400
              shadow-md shadow-blue-500/20
              transition-all duration-200
              hover:shadow-lg hover:shadow-blue-500/30
              disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
          >
            进入
          </button>
          <p v-if="error" class="text-sm text-red-500 dark:text-red-400">{{ error }}</p>
        </form>

        <!-- 已验证：列表 -->
        <div v-else class="flex-1 overflow-y-auto p-4 space-y-3">
          <!-- 新增表单 -->
          <div
            v-if="adding"
            class="p-4 rounded-xl space-y-3
              bg-blue-50/60 dark:bg-blue-900/15
              border-2 border-dashed border-blue-200 dark:border-blue-800/60"
          >
            <input
              v-model="form.name"
              type="text"
              placeholder="网站名称"
              class="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 rounded-lg
                bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                placeholder-gray-500 dark:placeholder-gray-400
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                transition-all duration-200"
            />
            <input
              v-model="form.url"
              type="text"
              placeholder="https://example.com"
              class="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 rounded-lg
                bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                placeholder-gray-500 dark:placeholder-gray-400
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                transition-all duration-200"
            />
            <div class="flex items-center gap-2">
              <select
                v-model.number="form.interval"
                class="flex-1 px-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 rounded-lg
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  transition-all duration-200"
              >
                <option v-for="item in intervalOptions" :key="item.value" :value="item.value">
                  {{ item.label }}
                </option>
              </select>
              <button
                @click="submitAdd"
                :disabled="loading || !form.name.trim() || !form.url.trim()"
                class="px-5 py-2.5 rounded-lg text-sm font-semibold text-white
                  bg-gradient-to-r from-blue-500 to-cyan-400
                  shadow-md shadow-blue-500/20
                  transition-all duration-200
                  hover:shadow-lg hover:shadow-blue-500/30
                  disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
              >
                添加
              </button>
              <button
                @click="cancelForm"
                class="px-5 py-2.5 rounded-lg text-sm font-medium
                  text-gray-600 dark:text-gray-300
                  bg-white dark:bg-gray-700
                  border border-gray-200 dark:border-gray-600
                  hover:bg-gray-100 dark:hover:bg-gray-600
                  transition-colors duration-200"
              >
                取消
              </button>
            </div>
          </div>

          <!-- 载入中 -->
          <div v-if="loading && !monitors.length" class="flex justify-center py-10">
            <Icon icon="ph:spinner" class="w-6 h-6 text-blue-500 animate-spin" />
          </div>

          <!-- 监控条目 -->
          <div
            v-for="monitor in monitors"
            :key="monitor.id"
            class="rounded-xl transition-all duration-300
              bg-gray-50 dark:bg-gray-800/50
              border border-gray-100 dark:border-gray-700/60
              hover:border-blue-200 dark:hover:border-blue-900/60"
          >
            <!-- 编辑态 -->
            <div v-if="editingId === monitor.id" class="p-4 space-y-3">
              <input
                v-model="form.name"
                type="text"
                placeholder="网站名称"
                class="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 rounded-lg
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                  placeholder-gray-500 dark:placeholder-gray-400
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  transition-all duration-200"
              />
              <input
                v-model="form.url"
                type="text"
                placeholder="https://example.com"
                class="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 rounded-lg
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                  placeholder-gray-500 dark:placeholder-gray-400
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  transition-all duration-200"
              />
              <div class="flex items-center gap-2">
                <select
                  v-model.number="form.interval"
                  class="flex-1 px-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 rounded-lg
                    bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    transition-all duration-200"
                >
                  <option v-for="item in intervalOptionsFor(monitor)" :key="item.value" :value="item.value">
                    {{ item.label }}
                  </option>
                </select>
                <button
                  @click="submitEdit(monitor)"
                  :disabled="loading || !form.name.trim() || !form.url.trim()"
                  class="px-5 py-2.5 rounded-lg text-sm font-semibold text-white
                    bg-gradient-to-r from-blue-500 to-cyan-400
                    shadow-md shadow-blue-500/20
                    transition-all duration-200
                    hover:shadow-lg hover:shadow-blue-500/30
                    disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                >
                  保存
                </button>
                <button
                  @click="cancelForm"
                  class="px-5 py-2.5 rounded-lg text-sm font-medium
                    text-gray-600 dark:text-gray-300
                    bg-white dark:bg-gray-700
                    border border-gray-200 dark:border-gray-600
                    hover:bg-gray-100 dark:hover:bg-gray-600
                    transition-colors duration-200"
                >
                  取消
                </button>
              </div>
            </div>

            <!-- 展示态 -->
            <div v-else class="flex items-center gap-3 px-4 py-3">
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2 min-w-0">
                  <span class="truncate text-base font-bold text-gray-800 dark:text-gray-100">
                    {{ monitor.friendly_name }}
                  </span>
                  <span
                    class="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                    :class="STATUS_MAP[monitor.status]?.classes || STATUS_MAP.default.classes"
                  >
                    <span class="relative flex">
                      <span
                        class="w-2 h-2 rounded-full"
                        :class="STATUS_MAP[monitor.status]?.dot || STATUS_MAP.default.dot"
                      ></span>
                      <span
                        class="absolute inset-0 w-2 h-2 rounded-full animate-ping opacity-75"
                        :class="STATUS_MAP[monitor.status]?.dot || STATUS_MAP.default.dot"
                      ></span>
                    </span>
                    {{ STATUS_MAP[monitor.status]?.text || STATUS_MAP.default.text }}
                  </span>
                </div>
                <div class="mt-1 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <span class="truncate">{{ monitor.url }}</span>
                  <div class="w-1 h-1 shrink-0 rounded-full bg-gray-300 dark:bg-gray-600" />
                  <span class="shrink-0">{{ intervalText(monitor.interval) }}</span>
                </div>
              </div>

              <div class="flex shrink-0 items-center gap-1">
                <button
                  @click="startEdit(monitor)"
                  class="flex items-center justify-center w-9 h-9 rounded-full transition-colors duration-200
                    bg-white dark:bg-gray-700/50
                    text-gray-500 dark:text-gray-400
                    hover:text-blue-600 hover:bg-blue-50
                    dark:hover:text-blue-400 dark:hover:bg-blue-900/30"
                >
                  <Icon icon="ph:pencil-simple" class="w-4 h-4" />
                </button>
                <button
                  @click="toggleStatus(monitor)"
                  class="flex items-center justify-center w-9 h-9 rounded-full transition-colors duration-200
                    bg-white dark:bg-gray-700/50
                    text-gray-500 dark:text-gray-400
                    hover:text-amber-600 hover:bg-amber-50
                    dark:hover:text-amber-400 dark:hover:bg-amber-900/30"
                >
                  <Icon
                    :icon="monitor.status === 0 ? 'ph:play' : 'ph:pause'"
                    class="w-4 h-4"
                  />
                </button>
                <button
                  @click="remove(monitor)"
                  class="flex items-center justify-center w-9 h-9 rounded-full transition-colors duration-200
                    bg-white dark:bg-gray-700/50
                    text-gray-500 dark:text-gray-400
                    hover:text-red-600 hover:bg-red-50
                    dark:hover:text-red-400 dark:hover:bg-red-900/30"
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
  },
  editId: {
    type: Number,
    default: null
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
  0: { text: '暂停', classes: 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400', dot: 'bg-yellow-500 dark:bg-yellow-400' },
  1: { text: '准备中', classes: 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400', dot: 'bg-yellow-500 dark:bg-yellow-400' },
  2: { text: '在线', classes: 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400', dot: 'bg-green-500 dark:bg-green-400' },
  8: { text: '异常', classes: 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400', dot: 'bg-red-500 dark:bg-red-400' },
  9: { text: '离线', classes: 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400', dot: 'bg-red-500 dark:bg-red-400' },
  default: { text: '未知', classes: 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300', dot: 'bg-gray-400' }
}

const password = ref('')
const monitors = ref([])
const loading = ref(false)
const error = ref('')
const adding = ref(false)
const editingId = ref(null)
const form = ref({ name: '', url: '', interval: 300 })

const intervalOptions = INTERVAL_OPTIONS

const intervalText = (seconds) => `${Math.round((Number(seconds) || 300) / 60)} 分钟`

const intervalOptionsFor = (monitor) => {
  const value = Number(monitor.interval)
  if (INTERVAL_OPTIONS.some((item) => item.value === value)) return INTERVAL_OPTIONS
  return [{ value, label: intervalText(value) }, ...INTERVAL_OPTIONS]
}

const close = () => emit('update:modelValue', false)

const resetForm = () => {
  form.value = { name: '', url: '', interval: 300 }
  adding.value = false
  editingId.value = null
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

const load = async () => {
  loading.value = true
  error.value = ''

  try {
    monitors.value = await fetchMonitors()

    if (props.editId) {
      const target = monitors.value.find((item) => item.id === Number(props.editId))
      if (target) startEdit(target)
    }
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

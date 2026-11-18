<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div class="absolute inset-0 bg-black/60" @click="close"></div>

      <div
        class="relative w-full max-w-md p-6 rounded-2xl shadow-xl
          bg-white dark:bg-gray-800
          border border-gray-200 dark:border-gray-700"
      >
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-bold text-gray-900 dark:text-gray-100">
            {{ isAdmin ? '添加监控' : '管理' }}
          </h3>
          <div class="flex items-center gap-1">
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

        <form v-if="!isAdmin" @submit.prevent="submitLogin" class="space-y-4">
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
        </form>

        <form v-else @submit.prevent="submitAdd" class="space-y-4">
          <input
            v-model="name"
            type="text"
            placeholder="网站名称"
            class="w-full px-4 py-3 rounded-lg border-2 transition-all duration-200
              border-gray-200 dark:border-gray-600
              bg-gray-50 dark:bg-gray-700
              text-gray-900 dark:text-gray-100
              placeholder-gray-500 dark:placeholder-gray-400
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <input
            v-model="url"
            type="text"
            placeholder="https://example.com"
            class="w-full px-4 py-3 rounded-lg border-2 transition-all duration-200
              border-gray-200 dark:border-gray-600
              bg-gray-50 dark:bg-gray-700
              text-gray-900 dark:text-gray-100
              placeholder-gray-500 dark:placeholder-gray-400
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="submit"
            :disabled="loading || !name.trim() || !url.trim()"
            class="w-full py-3 rounded-lg font-semibold text-sm text-white
              bg-gradient-to-r from-blue-500 to-cyan-400
              transition-opacity duration-200
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            添加
          </button>
        </form>

        <p v-if="error" class="mt-4 text-sm text-red-500 dark:text-red-400">
          {{ error }}
        </p>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue'
import { Icon } from '@iconify/vue'
import { login, addMonitor } from '@/utils/admin'

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

const emit = defineEmits(['update:modelValue', 'login', 'logout', 'added'])

const password = ref('')
const name = ref('')
const url = ref('')
const error = ref('')
const loading = ref(false)

watch(() => props.modelValue, (open) => {
  if (open) error.value = ''
})

const close = () => emit('update:modelValue', false)

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
    await addMonitor(name.value.trim(), url.value.trim())
    name.value = ''
    url.value = ''
    emit('added')
    close()
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

const logout = () => {
  password.value = ''
  error.value = ''
  emit('logout')
}
</script>

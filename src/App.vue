<template>
    <div class="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-gray-50 to-gray-100 
      dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 transition-colors duration-300">
      <div class="flex-1 p-3 sm:p-8">
        <main class="max-w-7xl mx-auto space-y-8">
          <Header 
            ref="headerRef"
            :title="title"
            :is-refreshing="isRefreshing"
            :is-dark="isDark"
            :is-admin="isAdmin"
            @refresh="refreshData"
            @toggle-theme="toggleTheme"
            @open-admin="showAdminModal = true"
          />
          <Stats :monitors="monitors" />
          <!-- 筛选组件 -->
          <Filter 
            :monitors="monitors"
            @filter-change="handleFilterChange"
          />
          <Card 
            :monitors="filteredMonitors"
            :error="errorMessage"
            :is-admin="isAdmin"
            @delete="handleDelete"
          />
        </main>
      </div>
      <Footer />
      <AdminModal
        v-model="showAdminModal"
        :is-admin="isAdmin"
        @login="handleLogin"
        @logout="handleLogout"
        @added="refreshData"
      />
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { fetchMonitorData } from './utils/api'
  import { isAdmin as hasAdmin, clearAdmin, removeMonitor } from './utils/admin'
  import Header from './components/Header.vue'
  import Stats from './components/Stats.vue'
  import Filter from './components/Filter.vue'
  import Card from './components/Card.vue'
  import Footer from './components/Footer.vue'
  import AdminModal from './components/AdminModal.vue'
  
  const title = ref(import.meta.env.VITE_APP_TITLE || '状态监控')
  const monitors = ref([])
  const filteredMonitors = ref([])
  const isRefreshing = ref(false)
  const isDark = ref(false)
  const errorMessage = ref('')
  const isAdmin = ref(hasAdmin())
  const showAdminModal = ref(false)
  
  // 筛选相关状态
  const currentFilter = ref('all')
  const searchQuery = ref('')
  
  // 主题相关逻辑
  const initTheme = () => {
    isDark.value = localStorage.getItem('theme') === 'dark' || 
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
    updateTheme()
  }
  const updateTheme = () => document.documentElement.classList.toggle('dark', isDark.value)
  const toggleTheme = () => {
    isDark.value = !isDark.value
    localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
    updateTheme()
  }
  
  // 筛选处理函数
  const handleFilterChange = ({ filter, search, filteredMonitors: filtered }) => {
    currentFilter.value = filter
    searchQuery.value = search
    filteredMonitors.value = filtered
  }
  
  // 刷新数据
  const refreshData = async () => {
    if (isRefreshing.value) return
    isRefreshing.value = true
    monitors.value = []
    filteredMonitors.value = []
    errorMessage.value = ''
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 30000))
    try {
      monitors.value = await Promise.race([
        fetchMonitorData(),
        timeoutPromise
      ])
      filteredMonitors.value = [...monitors.value]
    } catch (error) {
      console.error('获取监控数据失败:', error)
      errorMessage.value = error.message === 'Timeout' 
        ? '请求超时，请检查网络连接后重试'
        : '获取监控数据失败，请稍后重试'
    } finally {
      isRefreshing.value = false
    }
  }
  
  onMounted(() => {
    initTheme()
    refreshData()
  })

  // 登录管理
  const handleLogin = () => {
    isAdmin.value = true
  }

  // 退出管理
  const handleLogout = () => {
    clearAdmin()
    isAdmin.value = false
    showAdminModal.value = false
  }

  // 删除监控
  const handleDelete = async (monitor) => {
    if (!window.confirm(`删除「${monitor.friendly_name}」？`)) return
    try {
      await removeMonitor(monitor.id)
    } catch (error) {
      window.alert(error.message)
    }
    isAdmin.value = hasAdmin()
    refreshData()
  }
  </script>
  

import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { VueQueryPlugin } from '@tanstack/vue-query'
import router from './router'
import { createPinia } from 'pinia'
import { i18n } from '@/service/locale'
const pinia = createPinia()

const app = createApp(App)
app.use(VueQueryPlugin)
app.use(router)
app.use(pinia)
app.use(i18n)

app.mount('#app')

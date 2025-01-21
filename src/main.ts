import { init } from '@aptabase/web'
import { createPinia } from 'pinia'
import { createApp } from 'vue'
import VueKonva from 'vue-konva'

import { version } from '../package.json'
import App from './App.vue'
import './assets/index.css'

init('A-SH-2497555130', {
  host: 'https://aptabase.fengrui.xyz',
  appVersion: version,
  isDebug: import.meta.env.DEV,
})

const pinia = createPinia()
const app = createApp(App)

app.use(pinia)
app.use(VueKonva)
app.mount('#app')

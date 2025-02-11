import { createPinia } from 'pinia';
import { createApp } from 'vue';

import App from './App.vue';
import { appMountedEvent } from './helper/aptabase';
import './assets/index.css';

const pinia = createPinia();
const app = createApp(App);

app.use(pinia);
app.mount('#app').$nextTick(() => {
	appMountedEvent();
});

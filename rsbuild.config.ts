import { defineConfig } from '@rsbuild/core';
import { pluginLess } from '@rsbuild/plugin-less';
import { pluginVue } from '@rsbuild/plugin-vue';
import { pluginSvg } from 'rsbuild-plugin-svg';

export default defineConfig({
  plugins: [pluginVue(), pluginLess(), pluginSvg()],
  html: {
    template: './index.html',
  },
});

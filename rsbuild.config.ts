import { defineConfig } from '@rsbuild/core';
import { pluginLess } from '@rsbuild/plugin-less';
import { pluginVue } from '@rsbuild/plugin-vue';
import { pluginGenerateFile } from 'rsbuild-plugin-generate-file';
import { pluginSvg } from 'rsbuild-plugin-svg';
import { version } from './package.json';

export default defineConfig({
	plugins: [
		pluginVue(),
		pluginLess(),
		pluginSvg(),
		pluginGenerateFile({
			type: 'json',
			output: './version.json',
			data: { version },
		}),
	],
	html: {
		template: './index.html',
	},
});

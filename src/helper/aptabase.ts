import { init, trackEvent } from '@aptabase/web';
import type { App } from 'vue';
import { version } from '../../package.json';

init('A-SH-2497555130', {
	host: 'https://aptabase.fengrui.xyz',
	appVersion: version,
	isDebug: import.meta.env.DEV,
});

export const appMountedEvent = () => {
	trackEvent('app_mounted');
};

export const downloadEvent = () => {
	trackEvent('download');
};

export const updateEvent = (newVersion: string) => {
	trackEvent('update', { newVersion });
};

export const install = (app: App) => {
	app.config.globalProperties.$aptabase = {
		appMountedEvent,
		downloadEvent,
	};

	appMountedEvent();
};

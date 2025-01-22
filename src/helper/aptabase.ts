import { init, trackEvent } from '@aptabase/web'
import { version } from '../../package.json'

init('A-SH-2497555130', {
  host: 'https://aptabase.fengrui.xyz',
  appVersion: version,
  isDebug: import.meta.env.DEV,
})

export function appMountedEvent() {
  trackEvent('app_mounted')
}

export function downloadEvent() {
  trackEvent('download')
}

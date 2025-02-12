/// <reference types="@rsbuild/core/types" />
/// <reference types="paper/dist/paper.d.ts" />

declare module '*.vue' {
	import type { DefineComponent } from 'vue';

	// biome-ignore lint/complexity/noBannedTypes: reason
	// biome-ignore lint/suspicious/noExplicitAny: reason
	const component: DefineComponent<{}, {}, any>;
	export default component;
}

declare module '*.svg?component' {
	import type { FunctionalComponent, SVGAttributes } from 'vue';

	const src: FunctionalComponent<SVGAttributes>;
	export default src;
}

declare module '*.svg?url' {
	const src: string;
	export default src;
}

declare module '*.svg?raw' {
	const src: string;
	export default src;
}

declare module '*.svg?skipsvgo' {
	import type { FunctionalComponent, SVGAttributes } from 'vue';

	const src: FunctionalComponent<SVGAttributes>;
	export default src;
}

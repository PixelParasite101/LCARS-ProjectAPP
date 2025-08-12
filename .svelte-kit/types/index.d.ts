type DynamicRoutes = {
	
};

type Layouts = {
	"/": undefined;
	"/crew": undefined;
	"/logs": undefined;
	"/operations": undefined;
	"/sensors": undefined
};

export type RouteId = "/" | "/crew" | "/logs" | "/operations" | "/sensors";

export type RouteParams<T extends RouteId> = T extends keyof DynamicRoutes ? DynamicRoutes[T] : Record<string, never>;

export type LayoutParams<T extends RouteId> = Layouts[T] | Record<string, never>;

export type Pathname = "/" | "/crew" | "/logs" | "/operations" | "/sensors";

export type ResolvedPathname = `${"" | `/${string}`}${Pathname}`;

export type Asset = never;
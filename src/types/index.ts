export * from './people';
export * from './calendar';
export * from './settings';
export * from './auth';

export type KeysMatching<T, V> = { [K in keyof T]-?: T[K] extends V ? K : never }[keyof T];

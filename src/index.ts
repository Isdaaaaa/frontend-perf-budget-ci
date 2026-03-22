import { defaultConfig, summarizeConfig } from './lib/config.js';

export const start = (): string => summarizeConfig(defaultConfig);

if (process.env.NODE_ENV !== 'test') {
  console.log(start());
}

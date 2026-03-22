import { defaultConfig, summarizeConfig } from './lib/config.js';

export { ArtifactParseError, ingestBaselineFromFiles, ingestBaselineFromStrings, parseBundleMetrics, parseLighthouseMetrics } from './ingest.js';
export type {
  ArtifactErrorCode,
  BaselineArtifactFileInput,
  BaselineArtifactInput,
  BaselineMetrics,
  BundleMetrics,
  LighthouseMetrics,
  NormalizedMetrics
} from './types.js';

export const start = (): string => summarizeConfig(defaultConfig);

if (process.env.NODE_ENV !== 'test') {
  console.log(start());
}

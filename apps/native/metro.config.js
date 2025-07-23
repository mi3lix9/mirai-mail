// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config");
const { FileStore } = require("metro-cache");
const { withNativeWind } = require("nativewind/metro");
const path = require("node:path");

const config = withTurborepoManagedCache(
  withMonorepoPaths(
    withNativeWind(getDefaultConfig(__dirname), {
      input: "./global.css",
      configPath: "./tailwind.config.js",
    })
  )
);

config.resolver.unstable_enablePackageExports = true;

config.resolver.disableHierarchicalLookup = true;

module.exports = config;

/**
 * Add the monorepo paths to the Metro config.
 * This allows Metro to resolve modules from the monorepo.
 *
 * @see https://docs.expo.dev/guides/monorepos/#modify-the-metro-config
 * @param {import('expo/metro-config').MetroConfig} innerConfig
 * @returns {import('expo/metro-config').MetroConfig}
 */
function withMonorepoPaths(innerConfig) {
  // biome-ignore lint/nursery/noGlobalDirnameFilename: Metro is not Vite
  const projectRoot = __dirname;
  const workspaceRoot = path.resolve(projectRoot, "../..");

  // #1 - Watch all files in the monorepo
  innerConfig.watchFolders = [workspaceRoot];

  // #2 - Resolve modules within the project's `node_modules` first, then all monorepo modules
  innerConfig.resolver.nodeModulesPaths = [
    path.resolve(projectRoot, "node_modules"),
    path.resolve(workspaceRoot, "node_modules"),
  ];

  return innerConfig;
}

/**
 * Move the Metro cache to the `.cache/metro` folder.
 * If you have any environment variables, you can configure Turborepo to invalidate it when needed.
 *
 * @see https://turbo.build/repo/docs/reference/configuration#env
 * @param {import('expo/metro-config').MetroConfig} config
 * @returns {import('expo/metro-config').MetroConfig}
 */
function withTurborepoManagedCache(metroConfig) {
  metroConfig.cacheStores = [
    new FileStore({ root: path.join(__dirname, ".cache/metro") }),
  ];
  return metroConfig;
}

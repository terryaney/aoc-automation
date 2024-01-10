import type { Setup } from "../types/common"
import version from "../version.js"

const packageJSON = ({
  language,
  author,
  packageManager,
  packageManagerVersion,
}: Setup) => {
  const build = language === "ts" ? { build: "aoc-automation build" } : {}
  const esbuild = language === "ts" ? { esbuild: "^0.19.8" } : {}
  const preferredPackageManager =
    packageManager && Boolean(packageManagerVersion)
      ? { packageManager: `^${packageManager}@${packageManagerVersion}` }
      : {}

  return {
    name: "advent-of-code",
    version: "1.0.0",
    description: `Advent of Code Solutions`,
    type: "module",
    scripts: {
      start: "aoc-automation day",
      ...build,
      format: "prettier -w src",
      "update:readme": "aoc-automation update:readme",
    },
    keywords: ["aoc"],
    author: author ?? "",
    license: "ISC",
    devDependencies: {
      "@types/node": "^16.11.6",
      "aoc-automation": `^${version}`,
      ...esbuild,
      prettier: "^2.8.0",
    },
    dependencies: {},
    engines: {
      node: ">=16.13.0",
    },
    ...preferredPackageManager,
  }
}

export default packageJSON

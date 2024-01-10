import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import kleur from "kleur";
import initPrompt from "../prompts/initPrompt.js";
import save from "../io/save.js";
import copy from "../io/copy.js";
import packageJSON from "../configs/packageJSON.js";
import launchJSON from "../configs/launchJSON.js";
import tsconfigJSON from "../configs/tsconfigJSON.js";
import prettierJSON from "../configs/prettierJSON.js";
import gitignoreTXT from "../configs/gitignoreTXT.js";
import prettierignoreTXT from "../configs/prettierignoreTXT.js";
import runnerJSON from "../configs/runnerJSON.js";
import envTXT from "../configs/envTXT.js";
import readmeMD from "../configs/readmeMD.js";
import readmeYearMD from "../configs/readmeYearMD.js";

import type { Setup } from "../types/common";

const dirname = path.dirname(fileURLToPath(import.meta.url));

const init = async () => {
	console.log("Initializing...");

	const setup: Setup = await initPrompt();

	const packageManagers = {
		npm: {
			install: "npm i",
			format: "npm run format",
			start: "npm start",
			version: "npm -v",
		},
		yarn: {
			install: "yarn",
			format: "yarn format",
			start: "yarn start",
			version: "yarn -v",
		},
		pnpm: {
			install: "pnpm install",
			format: "pnpm format",
			start: "pnpm start",
			version: "pnpm -v",
		},
	};

	const installCmd = packageManagers[setup.packageManager].install;
	const formatCmd = packageManagers[setup.packageManager].format;
	const startCmd = packageManagers[setup.packageManager].start;
	setup.packageManagerVersion = execSync(
		packageManagers[setup.packageManager].version,
	)
		.toString()
		.trim();

	const dir = setup.name;
	const srcDir = path.join(dir, "src");
	const config = runnerJSON(setup);

	if (fs.existsSync(dir)) {
		console.log("AoC Automation Project already exists.");
	} else {
		fs.mkdirSync(srcDir, { recursive: true });
		save(dir, "package.json", packageJSON(setup));
		save(dir, ".prettierrc.json", prettierJSON(setup));
		save(dir, ".gitignore", gitignoreTXT(setup));
		save(dir, ".prettierignore", prettierignoreTXT(setup));
		save(dir, ".env", envTXT);
		save(dir, "README.md", readmeMD(setup, startCmd, installCmd));

		if (setup.language === "ts") {
			save(dir, "tsconfig.json", tsconfigJSON(setup));

			if (setup.vscodeSettings) {
				const vscodeSettingsDir = path.join(dir, ".vscode");
				fs.mkdirSync(vscodeSettingsDir, { recursive: true });
				save(vscodeSettingsDir, "launch.json", launchJSON());
			}
		}

		save(srcDir, ".aoc-data.json", config);

		const templatesDir = path.resolve(
			dirname,
			"..",
			"..",
			"templates",
			setup.language,
		);

		copy(templatesDir, srcDir);

		console.log("\nInstalling dependencies...\n");
		execSync(installCmd, { cwd: dir, stdio: "inherit" });

		console.log("\nFormatting the source files...\n");
		execSync(formatCmd, { cwd: dir, stdio: "inherit" });
	}

	const yearDir = path.join(srcDir, setup.year.toString());

	if (fs.existsSync(yearDir)) {
		console.log(`Year ${setup.year} Project already exists.`);
	} else {
		fs.mkdirSync(yearDir, { recursive: true });
		save(
			yearDir,
			"README.md",
			readmeYearMD(
				setup.language,
				config.years.find(y => y.year === setup.year)!,
			),
		);
	}

	console.log(
		kleur.green("\nDone!\n\n") +
			`Go to the project's directory (cd ${dir}) and:\n` +
			"  - add your AoC session key to the .env file (optional)\n" +
			"  - tweak your template files in src/template (optional)\n" +
			`  - start solving the first puzzle: ${startCmd} 1\n\n` +
			"🎄🎄 GOOD LUCK! 🎄🎄",
	);
};

export default init;

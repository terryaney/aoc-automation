/**
 * Root for your util libraries.
 *
 * You can import them in the src/template/index.js,
 * or in the specific file.
 *
 * Note that this repo uses ES Modules, so you have to explicitly specify
 * .js extension (yes, .js not .ts - even for TypeScript files)
 * for imports that are not imported from node_modules.
 *
 * For example:
 *
 *   correct:
 *
 *     import _ fro 'lodash
 *     import myLib from '../utils/myLib.js'
 *     import { myUtil } from '../utils/index.js'
 *
 *   incorrect:
 *
 *     import _ fro 'lodash
 *     import myLib from '../utils/myLib'
 *     import { myUtil } from '../utils'
 */

/**
 * Root for your util libraries.
 *
 * You can import them in the src/template/index.ts,
 * or in the specific file.
 *
 * Note that this repo uses ES Modules, so you have to explicitly specify
 * .js extension (yes, .js not .ts - even for TypeScript files)
 * for imports that are not imported from node_modules.
 *
 * For example:
 *
 *   correct:
 *
 *     import _ from 'lodash'
 *     import myLib from '../utils/myLib.js'
 *     import { myUtil } from '../utils/index.js'
 *
 *   incorrect:
 *
 *     import _ from 'lodash'
 *     import myLib from '../utils/myLib.ts'
 *     import { myUtil } from '../utils/index.ts'
 *
 *   also incorrect:
 *
 *     import _ from 'lodash'
 *     import myLib from '../utils/myLib'
 *     import { myUtil } from '../utils'
 *
 */

export const parseLines = (rawInput) => rawInput.split("\n");

export const parseLinesIntoArrays = (rawInput, lineSplit, toNumber) =>
	parseLines(rawInput).map((line) => line.split(lineSplit).map((x) => toNumber ? Number(x) : x));

export const parseGrid = (rawInput) => rawInput.split("\n").map(l => l.split(""));

export const logGrid = (grid, title) => {
	console.log(title || "");
	const rows = grid.length;
	const cols = grid[0].length;
	const rowDigits = String(rows - 1).length;
	const colDigits = String(cols - 1).length;

	console.log(`${" ".repeat(rowDigits)} | ${Array.from({ length: cols }, (_, i) => i.toString().padStart(colDigits, "0") ).join(" ")}`);
	console.log(`${"-".repeat(rowDigits)}-${Array.from({ length: cols }, (_, i) => "-".padStart(colDigits, "-") ).join("-")}--`);
	grid.forEach((row, i) => {
		console.log(`${i.toString().padStart(rowDigits, "0")} | ${row.map( v => " ".repeat(colDigits - 1) + v).join(" ")}`);
	});
	console.log("")
};

export const movementDeltas = (includeDiagonals) =>
	includeDiagonals
		? [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]]
		: [[-1, 0], [1, 0], [0, -1], [0, 1]];
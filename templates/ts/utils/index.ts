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

export const parseLines = (rawInput: string): Array<string> => rawInput.split("\n");

export const parseLinesIntoArrays = (rawInput: string, lineSplit: string, toNumber: boolean = false): Array<Array<string | number>> =>
	parseLines(rawInput).map((line) => line.split(lineSplit).map((x) => toNumber ? Number(x) : x));

export const parseGrid = (rawInput: string): Array<Array<string>> => rawInput.split("\n").map(l => l.split(""));

export const logGrid = (grid: Array<Array<string>>, title?: string): void => {
	console.log(title || "");
	const rows = grid.length;
	const cols = grid[0].length;
	const rowDigits = String(rows - 1).length;
	const colDigits = String(cols - 1).length;

	console.log(`${" ".repeat(rowDigits)} ${Array.from({ length: cols }, (_, i) => i.toString().padStart(colDigits, "0") ).join(" ")}`);
	grid.forEach((row, i) => {
		console.log(`${i.toString().padStart(rowDigits, "0")} ${row.map( v => " ".repeat(colDigits - 1) + v).join(" ")}`);
	});
	console.log("")
};
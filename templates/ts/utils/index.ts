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

export const movementDeltas = (includeDiagonals?: boolean): Array<[number, number]> =>
	includeDiagonals
		? [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]]
		: [[-1, 0], [1, 0], [0, -1], [0, 1]];

type Point<TValue> = { x: number, y: number, value: TValue, visited: boolean };
type Grid<TValue> = { points: Array<Array<Point<TValue>>>, rows: number, cols: number };

export const parseGrid = <TValue = string>(rawInput: string, convert?: (value: string) => TValue, visited?: (value: string) => boolean): Grid<TValue> => {
	const convertFn = convert ?? ((value: string) => value as unknown as TValue);
	const visitedFn = visited ?? ((value: string) => false);
	const points = rawInput.split("\n").map((row, y) => row.split("").map((cell, x) => ({ x, y, value: convertFn(cell), visited: visitedFn(cell) })));
	return { points, rows: points.length, cols: points[0].length };
} 

export const logGrid = <TValue>(grid: Grid<TValue>, title?: string): void => {
	console.log(title || "");
	const rows = grid.rows;
	const cols = grid.cols;
	const rowDigits = String(rows - 1).length;
	const colDigits = String(cols - 1).length;

	// TODO: Should get max toString length of values to know how wide to make each col
	console.log(`${" ".repeat(rowDigits)} | ${Array.from({ length: cols }, (_, i) => i.toString().padStart(colDigits, "0") ).join(" ")}`);
	console.log(`${"-".repeat(rowDigits)}-${Array.from({ length: cols }, (_, i) => "-".padStart(colDigits, "-") ).join("-")}--`);
	grid.points.forEach((row, y) => {
		console.log(`${y.toString().padStart(rowDigits, "0")} | ${row.map( cell => " ".repeat(colDigits - 1) + cell.value).join(" ")}`);
	});
	console.log("")
};

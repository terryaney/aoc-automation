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

export const movementDeltas = (includeDiagonals?: boolean) =>
	includeDiagonals
		? [{ dx: -1, dy: -1, name: "NW"} as MovementDelta, { dx: -1, dy: 0, name: "W"} as MovementDelta, { dx: -1, dy: 1, name: "SW"} as MovementDelta, { dx: 0, dy: -1, name: "S"} as MovementDelta, { dx: 0, dy: 1, name: "N"} as MovementDelta, { dx: 1, dy: -1, name: "SE"} as MovementDelta, { dx: 1, dy: 0, name: "E"} as MovementDelta, { dx: 1, dy: 1, name: "NE"} as MovementDelta]
		: [{ dx: -1, dy: 0, name: "W"} as MovementDelta, { dx: 1, dy: 0, name: "E"} as MovementDelta, { dx: 0, dy: -1, name: "N"} as MovementDelta, { dx: 0, dy: 1, name: "S"} as MovementDelta];

export type MovementDelta = { dx: number, dy: number, name: string };
export type Point<TValue> = { x: number, y: number, value: TValue, visited: boolean };
export type Grid<TValue> = {
	points: Array<Array<Point<TValue>>>,
	rows: number,
	cols: number,
	isInside: (point: Array<number>) => boolean
};

export const parseGrid = <TValue = string>(rawInput: string, convert?: (value: string) => TValue, visited?: (value: string) => boolean): Grid<TValue> => {
	const convertFn = convert ?? ((value: string) => value as unknown as TValue);
	const visitedFn = visited ?? ((value: string) => false);
	const points = rawInput.split("\n").map((row, y) => row.split("").map((cell, x) => ({ x, y, value: convertFn(cell), visited: visitedFn(cell) })));

	return {
		points,
		rows: points.length,
		cols: points[0].length,
		isInside: ([x, y]) => x >= 0 && x < points[0].length && y >= 0 && y < points.length
	};
} 

export const logGrid = <TValue>(grid: Grid<TValue>, title?: string): void => {
	console.log((title || "") + "\n");
	const rows = grid.rows;
	const cols = grid.cols;
	const rowDigits = String(rows - 1).length;
	const colDigits = String(cols - 1).length;
	const maxCellSpace = Math.max(colDigits, grid.points.flat().reduce((max, cell) => Math.max(max, String(cell.value).length + 1), 0));
	console.log(`${" ".repeat(rowDigits)} | ${Array.from({ length: cols }, (_, i) => i.toString().padStart(colDigits, "0").padStart(maxCellSpace, " ") ).join(" ")}`);
	console.log(`${"-".repeat(rowDigits)}-${Array.from({ length: cols }, (_, i) => "-".padStart(maxCellSpace, "-") ).join("-")}--`);
	grid.points.forEach((row, y) => {
		console.log(`${y.toString().padStart(rowDigits, "0")} | ${row.map( cell => " ".repeat(maxCellSpace - 2) + (cell.visited ? "*" : " ") + cell.value).join(" ")}`);
	});
	console.log("")
};

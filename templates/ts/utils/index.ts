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

export class Movement {
	private static opposites: Record<Direction, Direction> = {
		"N": "S",
		"S": "N",
		"E": "W",
		"W": "E",
		"NE": "SW",
		"SW": "NE",
		"NW": "SE",
		"SE": "NW"
	};
	static getOppositeDirection = (direction: Direction): Direction => Movement.opposites[direction];
	static Directions = [
		{ dx: -1, dy: 0, direction: "W", opposite: Movement.opposites[ "W"] } as MovementDelta,
		{ dx: 0, dy: 1, direction: "N", opposite: Movement.opposites[ "N"] } as MovementDelta,
		{ dx: 1, dy: 0, direction: "E", opposite: Movement.opposites[ "E"] } as MovementDelta,
		{ dx: 0, dy: -1, direction: "S", opposite: Movement.opposites[ "S"] } as MovementDelta
	];
	static DirectionsWithDiagonals = [
		{ dx: -1, dy: 0, direction: "W", opposite: Movement.opposites[ "W"] } as MovementDelta,
		{ dx: -1, dy: -1, direction: "NW", opposite: Movement.opposites[ "NW"] } as MovementDelta,
		{ dx: 0, dy: 1, direction: "N", opposite: Movement.opposites[ "N"] } as MovementDelta,
		{ dx: 1, dy: 1, direction: "NE", opposite: Movement.opposites[ "NE"] } as MovementDelta,
		{ dx: 1, dy: 0, direction: "E", opposite: Movement.opposites[ "E"] } as MovementDelta,
		{ dx: 1, dy: -1, direction: "SE", opposite: Movement.opposites[ "SE"] } as MovementDelta,
		{ dx: 0, dy: -1, direction: "S", opposite: Movement.opposites[ "S"] } as MovementDelta,
		{ dx: -1, dy: 1, direction: "SW", opposite: Movement.opposites[ "SW"] } as MovementDelta,
	];
}

export type MovementDelta = { dx: number, dy: number, direction: Direction, opposite: Direction };
export type Point<TValue> = { x: number, y: number, value: TValue, visited: boolean };
export type Grid<TValue> = {
	points: Array<Array<Point<TValue>>>,
	rows: number,
	cols: number,
	isInside: (point: Array<number>) => boolean,
	find: (value: TValue) => Point<TValue> | undefined
};

export const parseGrid = <TValue = string>(rawInput: string, convert?: (value: string) => TValue, visited?: (value: string) => boolean): Grid<TValue> => {
	const convertFn = convert ?? ((value: string) => value as unknown as TValue);
	const visitedFn = visited ?? ((value: string) => false);
	const points = rawInput.split("\n").map((row, y) => row.split("").map((cell, x) => ({ x, y, value: convertFn(cell), visited: visitedFn(cell) })));

	return {
		points,
		rows: points.length,
		cols: points[0].length,
		isInside: ([x, y]) => x >= 0 && x < points[0].length && y >= 0 && y < points.length,
		find: (value: TValue) => {
			for (let y = 0; y < points.length; y++) {
				for (let x = 0; x < points[0].length; x++) {
					if (points[y][x].value === value) {
						return points[y][x];
					}
				}
			}
			return undefined;
		}
	};
} 

export const logGrid = <TValue>(grid: Grid<TValue>, title?: string): void => {
	console.log((title || "") + "\n");
	const rows = grid.rows;
	const cols = grid.cols;
	const rowDigits = String(rows - 1).length;
	const colDigits = String(cols - 1).length;
	const maxCellSpace = Math.max(colDigits, grid.points.flat().reduce((max, cell) => Math.max(max, String(cell.value).length + 1), 0));
	const logX_Axis = () => console.log(`${" ".repeat(rowDigits)} | ${Array.from({ length: cols }, (_, i) => i.toString().padStart(colDigits, "0").padStart(maxCellSpace, " ")).join(" ")}`);
	const logHorizontalLine = () => console.log(`${"-".repeat(rowDigits)}-${Array.from({ length: cols }, (_, i) => "-".padStart(maxCellSpace, "-")).join("-")}--`);
	
	logX_Axis();
	logHorizontalLine();
	grid.points.forEach((row, y) => {
		console.log(`${y.toString().padStart(rowDigits, "0")} | ${row.map( cell => " ".repeat(maxCellSpace - 2) + (cell.visited ? "*" : " ") + cell.value).join(" ")}`);
	});
	logHorizontalLine();
	logX_Axis();

	console.log("")
};

// https://medium.com/@urna.hybesis/pathfinding-algorithms-the-four-pillars-1ebad85d4c6b
export const aStar = <TValue = string>(
	grid: Grid<TValue>,
	start: PathNode,
	end: PathNode,
	movementDeltas: Array<MovementDelta>,	
	movementCost: (current: PathNode, neighbor: PathNode) => number = (_current, _neighbor) => 1,
	canMove: (neighbor: PathNode) => boolean = (neighbor) => grid.points[neighbor.y][neighbor.x].value != "#",
	includeAllPaths: boolean = false
): Array<Path> | undefined => {
	// Step 1: Find openList node with lowest totalCost, move node to closedList
	// Step 2: If currentNode = end, return path (reversed)
	// Step 3: Get neighbors of currentNode
	//		- If in closedList, skip
	//		- If not in openList, calculate costs, set parent, add to openList
	//		- If in openList and costFromStart is lower, update costFromStart and parent
	// Step 4: Repeat
	
	start.costToFinish = manhattanDistance(start, end);

	let isStartMovement = true;
	const pathsFound: Array<PathNode> = [];
	const openList = [start];
	const closedList: Array<PathNode> = [];
	const alternateParents: Record<string, Array<PathNode>> = {};
	
	while (openList.length > 0) {
		const currentNode = openList.reduce((minNode, node) => node.totalCost < minNode.totalCost ? node : minNode, openList[0]);
		const currentIndex = openList.indexOf(currentNode);
		
		openList.splice(currentIndex, 1);
		closedList.push(currentNode);

		if (currentNode.x === end.x && currentNode.y === end.y) {
			// Only ever > 0 if includeAllPaths is true
			if (pathsFound.length > 0) {
				const currentCost = currentNode.totalCost;
				
				// If hit end with higher score than current, we can quit since we'll always find lowest to highest and will never find another lower than this
				if (currentNode.totalCost > pathsFound[0].totalCost) break;
			}

			pathsFound.push(currentNode);
			if (!includeAllPaths) break; // only want one path...

			continue;
		}

		const neighbors = getNeighbors(grid, currentNode, movementDeltas.filter(d => isStartMovement || d.opposite != currentNode.direction));
		isStartMovement = false;

		for (const neighbor of neighbors) {
			if (!canMove(neighbor)) continue;
			const closedNeighbor = closedList.find(n =>
				n.x == neighbor.x && n.y == neighbor.y &&
				(!includeAllPaths || n.direction == neighbor.direction || n.direction == Movement.getOppositeDirection(neighbor.direction))
			);
			const costFromStart = currentNode.costFromStart + movementCost(currentNode, neighbor);

			if (closedNeighbor) {
				if (includeAllPaths && costFromStart == closedNeighbor.costFromStart) {
					addAlternateParent(closedNeighbor.clone(currentNode), alternateParents);
				}
				continue;
			}

			const openNeighbor = openList.find(n => n.x == neighbor.x && n.y == neighbor.y);

			if (!openNeighbor || (includeAllPaths && costFromStart <= openNeighbor.costFromStart)) {
				neighbor.costFromStart = costFromStart;
				neighbor.costToFinish = manhattanDistance(neighbor, end);
				neighbor.parent = currentNode;
				openList.push(neighbor);
			}
			else if (costFromStart < openNeighbor.costFromStart) {
				// need to clone if all paths...
				openNeighbor.costFromStart = costFromStart;
				openNeighbor.parent = currentNode;
			}
		}
	}

	if (pathsFound.length == 0) return undefined;
	
	const allPaths: Array<Path> = [];

	for (const endPath of pathsFound) {
		allPaths.push(...getPaths(endPath, alternateParents));
	}

	return allPaths;
};

const manhattanDistance = <TValue = string>(a: Point<TValue> | PathNode, b: Point<TValue> | PathNode): number => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);

export class Path {
	nodes: Array<PathNode>;
	get length(): number { return this.nodes.length; };
	get totalCost(): number { return this.nodes[this.nodes.length - 1].totalCost; };
	get lastNode(): PathNode { return this.nodes[this.nodes.length - 1]; };

	constructor(nodes: Array<PathNode>) {
		this.nodes = nodes;
	}
}
export class PathNode {
	x: number;
	y: number;
	costFromStart: number;
	costToFinish: number;
	get totalCost(): number { return this.costFromStart + this.costToFinish; };
	direction: Direction;
	parent?: PathNode;
	pathIndex: number;

	constructor(x: number, y: number, direction: Direction) {
		this.x = x;
		this.y = y;
		this.direction = direction;
		this.costFromStart = this.costToFinish = 0;
		this.pathIndex = -1;
	}

	clone(parent: PathNode): PathNode {
		const clone = new PathNode(this.x, this.y, this.direction);
		clone.costFromStart = this.costFromStart;
		clone.costToFinish = this.costToFinish;
		clone.parent = parent;
		return clone;
	}
}

const getNeighbors = <TValue = string>(grid: Grid<TValue>, node: PathNode, movementDeltas: Array<MovementDelta>): Array<PathNode> => {
	const neighbors = movementDeltas.map((delta) => {
		const x = node.x + delta.dx;
		const y = node.y + delta.dy;
	
		if (!grid.isInside([x, y])) return undefined;

		return new PathNode(x, y, delta.direction);
	}).filter(n => n != undefined);

	return neighbors as Array<PathNode>;
};

const serializeNode = (node?: PathNode) => `${node?.x},${node?.y}`;

const addAlternateParent = (node: PathNode, alternateParents: Record<string, Array<PathNode>>) => {
	const key = serializeNode(node);
	if (!alternateParents[key]) {
		alternateParents[key] = [node];
		return;
	}
	if (alternateParents[key].some(n => n.x == node.x && n.y == node.y)) return;
	alternateParents[key].push(node);
};

const getPaths = (node: PathNode, alternateParents: Record<string, Array<PathNode>>): Array<Path> => {
	const allPaths: Array<Path> = [];
	const path: Array<PathNode> = [];
	let current: PathNode | undefined = node;
	while (current) {
		path.push(current);
		current = current.parent;

		const alternateParent = alternateParents[serializeNode(current)];
		
		if (alternateParent) {
			const pathToEnd = [...path].reverse();
			for (const p of alternateParent) {
				const alternatePaths = getPaths(p, alternateParents);
				alternatePaths.forEach(p => allPaths.push(new Path([...p.nodes, ...pathToEnd])));
			}
		}
	}
	allPaths.push(new Path(path.reverse()));
	return allPaths;
};

export type Direction = 'N' | 'E' | 'S' | 'W' | 'NE' | 'SE' | 'SW' | 'NW';

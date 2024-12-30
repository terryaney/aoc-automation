/**
 * Parses the raw input into an array of lines.
 * @param {string} rawInput - The raw input string.
 * @returns {Array<string>} - The array of lines.
 */
export const parseLines = (rawInput) => rawInput.split("\n");

/**
 * Parses the raw input into an array of arrays, splitting each line by the specified delimiter.
 * @param {string} rawInput - The raw input string.
 * @param {string} lineSplit - The delimiter to split each line.
 * @param {boolean} [toNumber=false] - Whether to convert the split values to numbers.
 * @returns {Array<Array<string | number>>} - The array of arrays.
 */
export const parseLinesIntoArrays = (rawInput, lineSplit, toNumber = false) => 
    parseLines(rawInput).map((line) => 
        line.split(lineSplit).map((x) => toNumber ? Number(x) : x)
    );

/**
 * Represents movement directions and their opposites.
 */
export class Movement {
    static opposites = {
        "N": "S",
        "S": "N",
        "E": "W",
        "W": "E",
        "NE": "SW",
        "SW": "NE",
        "NW": "SE",
        "SE": "NW"
    };

    /**
     * Gets the opposite direction.
     * @param {Direction} direction - The direction to get the opposite of.
     * @returns {Direction} - The opposite direction.
     */
    static getOppositeDirection = (direction) => Movement.opposites[direction];

    /**
     * The list of movement deltas for cardinal directions.
     * @type {Array<MovementDelta>}
     */
    static Directions = [
        { dx: -1, dy: 0, direction: "W", opposite: Movement.opposites["W"] },
        { dx: 0, dy: 1, direction: "N", opposite: Movement.opposites["N"] },
        { dx: 1, dy: 0, direction: "E", opposite: Movement.opposites["E"] },
        { dx: 0, dy: -1, direction: "S", opposite: Movement.opposites["S"] }
    ];

    /**
     * The list of movement deltas for cardinal and diagonal directions.
     * @type {Array<MovementDelta>}
     */
    static DirectionsWithDiagonals = [
        { dx: -1, dy: 0, direction: "W", opposite: Movement.opposites["W"] },
        { dx: -1, dy: -1, direction: "NW", opposite: Movement.opposites["NW"] },
        { dx: 0, dy: 1, direction: "N", opposite: Movement.opposites["N"] },
        { dx: 1, dy: 1, direction: "NE", opposite: Movement.opposites["NE"] },
        { dx: 1, dy: 0, direction: "E", opposite: Movement.opposites["E"] },
        { dx: 1, dy: -1, direction: "SE", opposite: Movement.opposites["SE"] },
        { dx: 0, dy: -1, direction: "S", opposite: Movement.opposites["S"] },
        { dx: -1, dy: 1, direction: "SW", opposite: Movement.opposites["SW"] },
    ];
}

/**
 * Parses the raw input into a grid.
 * @param {string} rawInput - The raw input string.
 * @param {function(string): TValue} [convert] - The function to convert the raw input value.
 * @param {function(string): boolean} [visited] - The function to determine if a point is visited.
 * @returns {Grid<TValue>} - The parsed grid.
 */
export const parseGrid = (rawInput, convert, visited) => {
    const convertFn = convert ?? ((value) => value);
    const visitedFn = visited ?? ((value) => false);
    const points = rawInput.split("\n").map((row, y) => 
        row.split("").map((cell, x) => ({ x, y, value: convertFn(cell), visited: visitedFn(cell) }))
    );
    return {
        points,
        rows: points.length,
        cols: points[0].length,
        isInside: ([x, y]) => x >= 0 && x < points[0].length && y >= 0 && y < points.length,
        find: (value) => {
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
};

/**
 * Logs the grid to the console.
 * @param {Grid<TValue>} grid - The grid to log.
 * @param {string} [title] - The title to display above the grid.
 */
export const logGrid = (grid, title) => {
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
        console.log(`${y.toString().padStart(rowDigits, "0")} | ${row.map(cell => " ".repeat(maxCellSpace - 2) + (cell.visited ? "*" : " ") + cell.value).join(" ")}`);
    });
    logHorizontalLine();
    logX_Axis();
    console.log("");
};

/**
 * Performs the A* algorithm on the grid.
 * @param {Grid<TValue>} grid - The grid to search.
 * @param {PathNode} start - The starting node.
 * @param {PathNode} end - The ending node.
 * @param {Array<MovementDelta>} movementDeltas - The movement deltas.
 * @param {function(PathNode, PathNode): number} [movementCost] - The function to calculate the movement cost.
 * @param {function(PathNode): boolean} [canMove] - The function to determine if a move is possible.
 * @param {boolean} [includeAllPaths] - Whether to include all paths.
 * @returns {Array<Path> | undefined} - The found paths.
 */
export const aStar = (grid, start, end, movementDeltas, movementCost = (_current, _neighbor) => 1, canMove = (neighbor) => grid.points[neighbor.y][neighbor.x].value != "#", includeAllPaths = false) => {
    start.costToFinish = manhattanDistance(start, end);
    let isStartMovement = true;
    const pathsFound = [];
    const openList = [start];
    const closedList = [];
    const alternateParents = {};
    while (openList.length > 0) {
        const currentNode = openList.reduce((minNode, node) => node.totalCost < minNode.totalCost ? node : minNode, openList[0]);
        const currentIndex = openList.indexOf(currentNode);
        openList.splice(currentIndex, 1);
        closedList.push(currentNode);
        if (currentNode.x === end.x && currentNode.y === end.y) {
            if (pathsFound.length > 0) {
                const currentCost = currentNode.totalCost;
                if (currentNode.totalCost > pathsFound[0].totalCost)
                    break;
            }
            pathsFound.push(currentNode);
            if (!includeAllPaths)
                break;
            continue;
        }
        const neighbors = getNeighbors(grid, currentNode, movementDeltas.filter(d => isStartMovement || d.opposite != currentNode.direction));
        isStartMovement = false;
        for (const neighbor of neighbors) {
            if (!canMove(neighbor))
                continue;
            const closedNeighbor = closedList.find(n => n.x == neighbor.x && n.y == neighbor.y &&
                (!includeAllPaths || n.direction == neighbor.direction || n.direction == Movement.getOppositeDirection(neighbor.direction)));
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
                openNeighbor.costFromStart = costFromStart;
                openNeighbor.parent = currentNode;
            }
        }
    }
    if (pathsFound.length == 0)
        return undefined;
    const allPaths = [];
    for (const endPath of pathsFound) {
        allPaths.push(...getPaths(endPath, alternateParents));
    }
    return allPaths;
};

/**
 * Calculates the Manhattan distance between two points.
 * @param {PathNode} a - The first point.
 * @param {PathNode} b - The second point.
 * @returns {number} - The Manhattan distance.
 */
const manhattanDistance = (a, b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);

/**
 * Represents a path in the grid.
 */
export class Path {
    nodes;

    /**
     * Gets the length of the path.
     * @returns {number} - The length of the path.
     */
    get length() { return this.nodes.length; }

    /**
     * Gets the total cost of the path.
     * @returns {number} - The total cost of the path.
     */
    get totalCost() { return this.nodes[this.nodes.length - 1].totalCost; }

    /**
     * Gets the last node in the path.
     * @returns {PathNode} - The last node in the path.
     */
    get lastNode() { return this.nodes[this.nodes.length - 1]; }

    /**
     * Creates a new path.
     * @param {Array<PathNode>} nodes - The nodes in the path.
     */
    constructor(nodes) {
        this.nodes = nodes;
    }
}

/**
 * Represents a node in a path.
 */
export class PathNode {
    x;
    y;
    costFromStart;
    costToFinish;

    /**
     * Gets the total cost of the node.
     * @returns {number} - The total cost of the node.
     */
    get totalCost() { return this.costFromStart + this.costToFinish; }

    direction;
    parent;
    pathIndex;

    /**
     * Creates a new path node.
     * @param {number} x - The x coordinate of the node.
     * @param {number} y - The y coordinate of the node.
     * @param {Direction} direction - The direction of the node.
     */
    constructor(x, y, direction) {
        this.x = x;
        this.y = y;
        this.direction = direction;
        this.costFromStart = this.costToFinish = 0;
        this.pathIndex = -1;
    }

    /**
     * Clones the node with a new parent.
     * @param {PathNode} parent - The parent node.
     * @returns {PathNode} - The cloned node.
     */
    clone(parent) {
        const clone = new PathNode(this.x, this.y, this.direction);
        clone.costFromStart = this.costFromStart;
        clone.costToFinish = this.costToFinish;
        clone.parent = parent;
        return clone;
    }
}

/**
 * Gets the neighbors of a node.
 * @param {Grid<TValue>} grid - The grid.
 * @param {PathNode} node - The node.
 * @param {Array<MovementDelta>} movementDeltas - The movement deltas.
 * @returns {Array<PathNode>} - The neighbors.
 */
const getNeighbors = (grid, node, movementDeltas) => {
    const neighbors = movementDeltas.map((delta) => {
        const x = node.x + delta.dx;
        const y = node.y + delta.dy;
        if (!grid.isInside([x, y]))
            return undefined;
        return new PathNode(x, y, delta.direction);
    }).filter(n => n != undefined);
    return neighbors;
};

/**
 * Serializes a node to a string.
 * @param {PathNode} node - The node.
 * @returns {string} - The serialized node.
 */
const serializeNode = (node) => `${node?.x},${node?.y}`;

/**
 * Adds an alternate parent to a node.
 * @param {PathNode} node - The node.
 * @param {Object} alternateParents - The alternate parents.
 */
const addAlternateParent = (node, alternateParents) => {
    const key = serializeNode(node);
    if (!alternateParents[key]) {
        alternateParents[key] = [node];
        return;
    }
    if (alternateParents[key].some(n => n.x == node.x && n.y == node.y))
        return;
    alternateParents[key].push(node);
};

/**
 * Gets the paths from a node.
 * @param {PathNode} node - The node.
 * @param {Object} alternateParents - The alternate parents.
 * @returns {Array<Path>} - The paths.
 */
const getPaths = (node, alternateParents) => {
    const allPaths = [];
    const path = [];
    let current = node;
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
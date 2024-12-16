/**
 * Splits the raw input string into an array of lines.
 * @param {string} rawInput - The raw input string.
 * @returns {Array<string>} An array of lines.
 */
export const parseLines = (rawInput) => rawInput.split("\n");

/**
 * Splits the raw input string into an array of arrays, splitting each line by the specified delimiter.
 * Optionally converts the elements to numbers.
 * @param {string} rawInput - The raw input string.
 * @param {string} lineSplit - The delimiter to split each line.
 * @param {boolean} [toNumber=false] - Whether to convert the elements to numbers.
 * @returns {Array<Array<string | number>>} An array of arrays with the split elements.
 */
export const parseLinesIntoArrays = (rawInput, lineSplit, toNumber = false) => 
    parseLines(rawInput).map((line) => line.split(lineSplit).map((x) => toNumber ? Number(x) : x));

/**
 * Returns an array of movement deltas for grid navigation.
 * @param {boolean} [includeDiagonals=false] - Whether to include diagonal movements.
 * @returns {Array<[number, number]>} An array of movement deltas.
 */
export const movementDeltas = (includeDiagonals) => 
    includeDiagonals
        ? [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]]
        : [[-1, 0], [1, 0], [0, -1], [0, 1]];

/**
 * Parses the raw input string into a grid of points.
 * @template TValue
 * @param {string} rawInput - The raw input string.
 * @param {(value: string) => TValue} [convert] - A function to convert the cell value.
 * @param {(value: string) => boolean} [visited] - A function to determine if a cell is visited.
 * @returns {Grid<TValue>} The parsed grid.
 */
export const parseGrid = (rawInput, convert, visited) => {
    const convertFn = convert ?? ((value) => value);
    const visitedFn = visited ?? ((value) => false);
    const points = rawInput.split("\n").map((row, y) => 
        row.split("").map((cell, x) => ({
            x,
            y,
            value: convertFn(cell),
            visited: visitedFn(cell)
        }))
    );
    return { points, rows: points.length, cols: points[0].length };
};

/**
 * Logs the grid to the console with an optional title.
 * @template TValue
 * @param {Grid<TValue>} grid - The grid to log.
 * @param {string} [title] - The optional title to display.
 */
export const logGrid = (grid, title) => {
    console.log(title || "");
    const rows = grid.rows;
    const cols = grid.cols;
    const rowDigits = String(rows - 1).length;
    const colDigits = String(cols - 1).length;
    console.log(`${" ".repeat(rowDigits)} | ${Array.from({ length: cols }, (_, i) => i.toString().padStart(colDigits, "0")).join(" ")}`);
    console.log(`${"-".repeat(rowDigits)}-${Array.from({ length: cols }, (_, i) => "-".padStart(colDigits, "-")).join("-")}--`);
    grid.points.forEach((row, y) => {
        console.log(`${y.toString().padStart(rowDigits, "0")} | ${row.map(cell => " ".repeat(colDigits - 1) + cell.value).join(" ")}`);
    });
    console.log("");
};
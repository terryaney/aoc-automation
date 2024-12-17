import run from "aoc-automation"
import * as util from "../../utils/index.js";

const solve = (rawInput, isPart1) => {
	const input = parseInput(rawInput);

	let total = 0;

	// Code solution here...

	return total;
};

const parseInput = (rawInput) => {
	const lines = util.parseLines(rawInput);
	return lines;
}

const part1 = (rawInput) => solve(rawInput, true);
const part2 = (rawInput) => solve(rawInput, false);

run({
	part1: {
		tests: [
			{
				input: `
				{testData}
				`,
				expected: "{expected}"
			},
		],
		solution: part1,
	},
	part2: {
		testsPending: [
			{
				input: `
				{testDataPending}
				`,
				expected: "{expectedPending}"
			},
		],
		solution: part2,
	},
	trimTestInputs: true,
	onlyTests: true
})

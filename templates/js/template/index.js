import run from "aoc-automation"
import * as util from "../../utils/index.js";

const solve = (rawInput, isPart1, testName) => {
	const input = parseInput(rawInput);

	if (isPart1 && testName != undefined) {
		console.log("");
		console.log("------");
		console.log(`${testName} Input`);
		console.log(input);
		console.log("------");
	}

	let total = 0;

	// Code solution here...

	return total;
};

const parseInput = (rawInput) => {
	const lines = util.parseLines(rawInput);
	return lines;
}

const part1 = (rawInput, testName) => solve(rawInput, true, testName);
const part2 = (rawInput, testName) => 1 == 1 ? 0 : solve(rawInput, false, testName);

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

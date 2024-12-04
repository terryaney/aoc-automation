import run from "aoc-automation"

const parseInput = (rawInput) => rawInput

const solve = (rawInput, isPart1) => {
	const input = parseInput(rawInput);

	if (isPart1) {
	} else {
	}
};

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

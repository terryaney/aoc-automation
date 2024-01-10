import type { Setup, Config, DayConfig } from "../types/common";

const aocAutomationDaysJSON = (): DayConfig[] =>
	new Array(25).fill(0).map((_, i) => ({
		title: null,
		part1: {
			solved: false,
			result: null,
			attempts: [],
			time: null,
		},
		part2: {
			solved: false,
			result: null,
			attempts: [],
			time: null,
		},
	}));

const aocAutomationDataJSON = ({
	year,
	packageManager,
	language,
}: Setup): Config => {
	return {
		version: 1,
		language,
		packageManager,
		years: [
			{
				year,
				days: aocAutomationDaysJSON(),
			},
		],
	};
};

export { aocAutomationDaysJSON };
export default aocAutomationDataJSON;

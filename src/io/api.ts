import fetch from "node-fetch";
import { JSDOM } from "jsdom";
import { readFileSync, writeFileSync, existsSync, statSync } from "fs";
import kleur from "kleur";
import { Config } from "../types/common";

const USER_AGENT_HEADER = {
	"User-Agent":
		"github.com/terryaney/aoc-automation by terry.aney@icloud.com",
};

const strToNum = (time: string) => {
	const entries: { [key: string]: number } = {
		one: 1,
		two: 2,
		three: 3,
		four: 4,
		five: 5,
		six: 6,
		seven: 7,
		eight: 8,
		nine: 9,
		ten: 10,
	};

	return entries[time] || NaN;
};

let canSubmit = true;
let delayStart = 0;
let delayAmount = 0;

enum Status {
	SOLVED,
	WRONG,
	ERROR,
}

const timeToReadable = (d: number, h: number, m: number, s: number) => {
	return (
		(d !== 0 ? `${d}d ` : "") +
		(h !== 0 ? `${h}h ` : "") +
		(m !== 0 ? `${m}m ` : "") +
		(s !== 0 ? `${s}s ` : "")
	);
};

const msToReadable = (ms: number) => {
	const msSecond = 1000;
	const msMinute = 60 * msSecond;
	const msHour = 60 * msMinute;
	const msDay = 24 * msHour;

	const d = Math.floor(ms / msDay);
	const h = Math.floor((ms - msDay * d) / msHour);
	const m = Math.floor((ms - msDay * d - msHour * h) / msMinute);
	const s = Math.floor(
		(ms - msDay * d - msHour * h - msMinute * m) / msSecond,
	);

	return timeToReadable(d, h, m, s);
};

const handleErrors = (e: Error) => {
	if (e.message === "400" || e.message === "500") {
		console.log(
			kleur.red("INVALID SESSION KEY\n\n") +
				"Please make sure that the session key in the .env file is correct.\n" +
				"You can find your session key in the 'session' cookie at:\n" +
				"https://adventofcode.com\n\n" +
				kleur.bold(
					"Restart the script after changing the .env file.\n",
				),
		);
	} else if (e.message.startsWith("5")) {
		console.log(kleur.red("SERVER ERROR"));
	} else if (e.message === "404") {
		console.log(kleur.yellow("CHALLENGE NOT YET AVAILABLE"));
	} else {
		console.log(
			kleur.red(
				"UNEXPECTED ERROR\nPlease check your internet connection.\n\nIf you think it's a bug, create an issue on github.\nHere are some details to include:\n",
			),
		);
		console.log(e);
	}

	return Status["ERROR"];
};

const getPuzzleInfo = async (year: number, day: number) => {
	const API_URL = process.env.AOC_API ?? "https://adventofcode.com";

	try {
		const res = await fetch(`${API_URL}/${year}/day/${day}`, {
			headers: {
				cookie: `session=${process.env.AOC_SESSION_KEY}`,
				...USER_AGENT_HEADER,
			},
		});

		if (res.status !== 200) {
			throw new Error(String(res.status));
		}

		let part1 = await res.text();
		// Extract the content of the h2 element using a regular expression
		let matches = part1.match(/<h2>--- Day \d+: (.*?) ---<\/h2>/);
		const title = matches ? matches[1] : null;
		
		const starParts = part1.split("--- Part Two ---");
		part1 = starParts[0];
		const part2 = starParts.length == 2 ? starParts[1] : undefined;

		matches = part1.match(/<pre><code>(.*?)<\/code><\/pre>/s);
		const testData = matches ? matches[1].trim() : null;

		matches = part1.match(/<code><em>(.*?)<\/em><\/code>/gs);
		const expected = matches ? matches[matches.length - 1].match(/<em>(.*?)<\/em>/)![1].trim() : "0";
		
		let testData2: string | null = null;
		let expected2: string | null = null;

		if (part2 != undefined) {
			matches = part2.match(/<pre><code>(.*?)<\/code><\/pre>/s);
			testData2 = matches ? matches[1].trim() : testData;
	
			matches = part2.match(/<code><em>(.*?)<\/em><\/code>/gs);
			expected2 = matches ? matches[matches.length - 1].match(/<em>(.*?)<\/em>/)![1].trim() : "0";
		}

		return [title, testData, expected, testData2, expected2];
	} catch (error) {
		handleErrors(error as Error);
		return [null, null, null, null, null];
	}
};

const getInput = async (year: number, day: number, inputFilePath: string, dayIndexFilePath: string, puzzleInfo: (string | null)[]) => {
	const API_URL = process.env.AOC_API ?? "https://adventofcode.com";

	if (existsSync(inputFilePath) && statSync(inputFilePath).size > 0) {
		console.log(kleur.yellow(`INPUT DATA FOR AOC ${year} DAY ${day} ALREADY FETCHED`));
	}
	else {
		try {
			const res = await fetch(`${API_URL}/${year}/day/${day}/input`, {
				headers: {
					cookie: `session=${process.env.AOC_SESSION_KEY}`,
					...USER_AGENT_HEADER,
				},
			});
	
			if (res.status !== 200) {
				throw new Error(String(res.status));
			}
	
			const body = await res.text();
	
			writeFileSync(inputFilePath, body.replace(/\n$/, ""));
			console.log(kleur.green(`INPUT DATA FOR AOC ${year} DAY ${day} SAVED!`));
		} catch (error) {
			handleErrors(error as Error);			
		}
	}
	
	if (puzzleInfo != undefined) {
		const [_, testData1, expected1, testData2, expected2] = puzzleInfo;

		if (testData1 == null) {
			console.log(kleur.yellow(`TEST CASE DATA FOR AOC ${year} DAY ${day} NOT AVAILABLE`));
		}
		else {
			if (existsSync(dayIndexFilePath)) {
				let dayIndexContent = readFileSync(dayIndexFilePath).toString();
				if (dayIndexContent.indexOf("{testData") == -1 && dayIndexContent.indexOf("{expected") == -1) {
					console.log(kleur.yellow(`TEST CASES FOR AOC ${year} DAY ${day} ALREADY INSERTED`));
				}
				else {
					let saveFile = false;
					let regex = /([ \t]*)\{testData\}/;
					let match = dayIndexContent.match(regex);
					let testCaseInserted = false;
					
					if (match) {
						const indent = match[1];
						const testDataIndented = testData1
							.split("\n")
							.filter(l => l != "")
							.map(line => `${indent}${line}`)
							.join("\n");
						dayIndexContent = dayIndexContent.replace(
							regex,
							testDataIndented,
						);
						saveFile = true;
						testCaseInserted = true;
					}
	
					if (expected1 != null) {
						regex = /"\{expected\}"/;
						match = dayIndexContent.match(regex);
						if (match) {
							dayIndexContent = dayIndexContent.replace(regex, expected1);
							saveFile = true;
							testCaseInserted = true;
						}
					}

					if (!testCaseInserted) {
						console.log(kleur.yellow(`TEST CASE FOR AOC ${year} DAY ${day} PART 1 ALREADY INSERTED`));
					}
					else {
						console.log(kleur.green(`TEST CASE FOR AOC ${year} DAY ${day} PART 1 HAS BEEN INSERTED!`));
					}

					testCaseInserted = testData2 == null && expected2 == null;
	
					if (testData2 != null) {
						regex = /([ \t]*)\{testDataPending\}/;
						match = dayIndexContent.match(regex);
						
						if (match) {
							const indent = match[1];
							const testDataIndented = testData2
								.split("\n")
								.filter(l => l != "")
								.map(line => `${indent}${line}`)
								.join("\n");
							dayIndexContent = dayIndexContent.replace(
								regex,
								testDataIndented,
							);
	
							dayIndexContent = dayIndexContent.replace("testsPending:", "tests:");						
							saveFile = true;
							testCaseInserted = true;
						}
					}
	
					if (expected2 != null) {
						regex = /"\{expectedPending\}"/;
						match = dayIndexContent.match(regex);
						if (match) {
							dayIndexContent = dayIndexContent.replace(regex, expected2);
							saveFile = true;
							testCaseInserted = true;
						}
					}

					if (!testCaseInserted) {
						console.log(kleur.yellow(`TEST CASE FOR AOC ${year} DAY ${day} PART 2 ALREADY INSERTED`));
					}
					else if ( testData2 != null || expected2 != null) {
						console.log(kleur.green(`TEST CASE FOR AOC ${year} DAY ${day} PART 2 HAS BEEN INSERTED!`));
					}
					
					if (saveFile) {
						writeFileSync(dayIndexFilePath, dayIndexContent);
					}
				}
			}
		}
	}
};

const sendSolution = (
	year: number,
	day: number,
	part: 1 | 2,
	solution: number | string,
): Promise<Status> => {
	const API_URL = process.env.AOC_API ?? "https://adventofcode.com";

	if (!canSubmit) {
		const now = Date.now();
		const remainingMs = delayAmount - (now - delayStart);

		if (remainingMs <= 0) {
			canSubmit = true;
		} else {
			console.log(
				kleur.red(`You have to wait: ${msToReadable(remainingMs)}`),
			);
			return Promise.resolve(Status["ERROR"]);
		}
	}

	return fetch(`${API_URL}/${year}/day/${day}/answer`, {
		headers: {
			cookie: `session=${process.env.AOC_SESSION_KEY}`,
			"content-type": "application/x-www-form-urlencoded",
			...USER_AGENT_HEADER,
		},
		method: "POST",
		body: `level=${part}&answer=${encodeURIComponent(solution)}`,
	})
		.then(res => {
			if (res.status !== 200) {
				throw new Error(String(res.status));
			}

			return res.text();
		})
		.then(body => {
			const $main = new JSDOM(body).window.document.querySelector("main");

			let status = Status["ERROR"];

			const info =
				$main !== null
					? ($main.textContent as string).replace(/\[.*\]/, "").trim()
					: "Can't find the main element";

			if (info.includes("That's the right answer")) {
				console.log(`Status`, kleur.green(`PART ${part} SOLVED!`));
				return Status["SOLVED"];
			} else if (info.includes("That's not the right answer")) {
				console.log("Status:", kleur.red("WRONG ANSWER"));
				console.log(`\n${info}\n`);
				status = Status["WRONG"];
			} else if (info.includes("You gave an answer too recently")) {
				console.log("Status:", kleur.yellow("TO SOON"));
			} else if (
				info.includes("You don't seem to be solving the right level")
			) {
				console.log(
					"Status:",
					kleur.yellow("ALREADY COMPLETED or LOCKED"),
				);
			} else {
				console.log("Status:", kleur.red("UNKNOWN RESPONSE\n"));
				console.log(`\n${info}\n`);
			}

			const waitStr = info.match(
				/(one|two|three|four|five|six|seven|eight|nine|ten) (second|minute|hour|day)/,
			);
			const waitNum = info.match(/\d+\s*(s|m|h|d)/g);

			if (waitStr !== null || waitNum !== null) {
				const waitTime: { [key: string]: number } = {
					s: 0,
					m: 0,
					h: 0,
					d: 0,
				};

				if (waitStr !== null) {
					const [_, time, unit] = waitStr;
					waitTime[unit[0]] = strToNum(time);
				} else if (waitNum !== null) {
					waitNum.forEach(x => {
						waitTime[x.slice(-1)] = Number(x.slice(0, -1));
					});
				}

				canSubmit = false;
				delayStart = Date.now();
				delayAmount =
					(waitTime.d * 24 * 60 * 60 +
						waitTime.h * 60 * 60 +
						waitTime.m * 60 +
						waitTime.s) *
					1000;

				const delayStr = timeToReadable(
					waitTime.d,
					waitTime.h,
					waitTime.m,
					waitTime.s,
				);

				console.log(`Next request possible in: ${delayStr}`);
			}

			return status;
		})
		.catch(handleErrors);
};

export { getInput, getPuzzleInfo, sendSolution, Status };

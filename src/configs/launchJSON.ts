const launchJSON = () => {
    return {
        version: "0.2.0",
        configurations: [
            {
                type: "node",
                request: "launch",
                name: "Launch Program",
                "program.description": "Start debugger with the desired src\\{year}\\{day}\\index.ts open.",
                program: "${file}",
                preLaunchTask: "tsc: build - tsconfig.json",
                outFiles: [
                    "${workspaceFolder}/dist/**/*.js"
                ],
                sourceMaps: true,
                resolveSourceMapLocations: [
                    "${workspaceFolder}/**",
                    "!**/node_modules/**"
                ]
            }
        ]
    };
};

export default launchJSON;

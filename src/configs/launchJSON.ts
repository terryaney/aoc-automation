const launchJSON = () => {
	return {
		"version": "0.2.0",
		"configurations": [
			{
				"type": "node",
				"request": "launch",
				"name": "Launch Program",
				"program": "${file}",
				"preLaunchTask": "tsc: build - tsconfig.json"
			}
		]
	}
  }
  
  export default launchJSON
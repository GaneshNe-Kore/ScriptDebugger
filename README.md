# ScriptDebugger

## Introduction

This repository contains a script debugger tool along with basic configuration information in `config.json`.

## Installation

To run the script debugger tool, follow these steps:

1. **Install Node.js:** If you haven't already, download and install Node.js from [nodejs.org](https://nodejs.org/).
2. **Install Dependencies:** Navigate to the project directory in your terminal and run `npm install` to install the required dependencies.

## Usage

Before running the debugger, ensure you have the latest environment and content variables. Follow these steps:

1. **Update Environment Variables:**
    - Open `config.json`.
    - Update the values for `streamID`, `clientId`, and `secretKey` under the appropriate environment (`prod`, `staging`, `developer`).

2. **Prepare for Debugging:**
    - The `debugger.js` file serves as the entry point for debugging. Ensure it's correctly set up.
    - Use the `getBotVariables()` function in `debugger.js` to update environment and content variables. Comment out this function after updating.

3. **Copy Script Node:**
    - Copy the context immediately before the `node` command in the script you intend to debug.
    - You can obtain this from the network tab, debugger log console, or analytics.

4. **Run the Debugger:**
    - Paste the copied script node into the debug function.
    - Ensure that `script.debug();` is not commented out in `debugger.js`.
    - Run the command `node debugger.js` in your terminal.

## Example Configuration (config.json)

```json
{
    "env": {
        "prod": {
            "streamID": "",
            "clientId": "",
            "secretKey": ""
        },
        "staging": {
            "streamID": "",
            "clientId": "",
            "secretKey": ""
        },
        "developer": {
            "streamID": "",
            "clientId": "",
            "secretKey": "",
            "version": "1.1",
            "host": "bots.kore.ai"
        }
    }
}

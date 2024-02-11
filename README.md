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



# Systematic Debugging Approach

## Overview

This document outlines a systematic approach to debugging script nodes within the "Get Account Balance" dialog. Following these steps can help identify and resolve issues efficiently.

## Steps to Debugging

1. **Identify the Issue:**
   - Pinpoint the script node that is failing within the dialog.

2. **Execute the Bot:**
   - Run the bot with any utterance that qualifies for getting the balance.

3. **Analyze the Failure:**
   - Once the bot is executed and the issue occurs, analyze which script node is failing.

4. **Copy Failed Node's Script and Context:**
   - Copy the script from the failed node and the immediate context before the node.

5. **Paste Context in JSON Format:**
   - Paste the copied context into a JSON format for reference.

6. **Debug Script:**
   - Paste the script into the debug function and ensure that you have added debugger points in the script.

7. **Start Debugging:**
   - Begin debugging by running the debugger. You can use `debugger.log` as the starting file.

## Important Considerations

- Pay close attention to variables, conditions, and the flow of the script to identify the root cause of the issue efficiently.
- Document any observations or findings during the debugging process for future reference.


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

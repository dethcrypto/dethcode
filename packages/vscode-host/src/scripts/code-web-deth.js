/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// @ts-check

const testWebLocation = require.resolve('@vscode/test-web');

const path = require('path');
const cp = require('child_process');

const minimist = require('minimist');
const opn = require('opn');

const APP_ROOT = path.join(__dirname, '..');
const DETH_EXTENSIONS_ROOT = path.join(APP_ROOT, '../dist/extensions');

async function main() {
	const args = minimist(process.argv.slice(2), {
		boolean: [
			'help',
			'playground'
		],
		string: [
			'host',
			'port',
			'extensionPath',
			'browser',
			'browserType'
		],
	});

	if (args.help) {
		console.log(
			'./scripts/code-web.sh|bat[, folderMountPath[, options]]\n' +
			'                           Start with an empty workspace and no folder opened in explorer\n' +
			'  folderMountPath          Open local folder (eg: use `.` to open current directory)\n'
		);
		startServer(['--help']);
		return;
	}

	const serverArgs = [];

	const HOST = args['host'] ?? 'localhost';
	const PORT = args['port'] ?? '8080';

	if (args['host'] === undefined) {
		serverArgs.push('--host', HOST);
	}
	if (args['port'] === undefined) {
		serverArgs.push('--port', PORT);
	}

	console.log("Serving extensions from:", DETH_EXTENSIONS_ROOT);
	serverArgs.push('--extensionPath', DETH_EXTENSIONS_ROOT);

	let openSystemBrowser = false;
	if (!args['browser'] && !args['browserType']) {
		serverArgs.push('--browserType', 'none');
		openSystemBrowser = true;
	}

	serverArgs.push('--sourcesPath', APP_ROOT);

	serverArgs.push(...process.argv.slice(2).filter(v => !v.startsWith('--playground') && v !== '--no-playground'));

	startServer(serverArgs);
	if (openSystemBrowser) {
		opn(`http://${HOST}:${PORT}/`);
	}
}

function startServer(runnerArguments) {
	const env = { ...process.env };

	console.log(`Starting @vscode/test-web: ${testWebLocation} ${runnerArguments.join(' ')}`);
	const proc = cp.spawn(process.execPath, [testWebLocation, ...runnerArguments], { env, stdio: 'inherit' });

	proc.on('exit', (code) => process.exit(code));

	process.on('exit', () => proc.kill());
	process.on('SIGINT', () => {
		proc.kill();
		process.exit(128 + 2); // https://nodejs.org/docs/v14.16.0/api/process.html#process_signal_events
	});
	process.on('SIGTERM', () => {
		proc.kill();
		process.exit(128 + 15); // https://nodejs.org/docs/v14.16.0/api/process.html#process_signal_events
	});
}

main().catch(err => {
	console.error(err);
	process.exit(1);
});

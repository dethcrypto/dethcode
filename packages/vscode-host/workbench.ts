import { create, IWorkbenchConstructionOptions, IWorkspaceProvider, IWorkspace } from 'vs/workbench/workbench.web.api';
import { URI, UriComponents } from 'vs/base/common/uri';
declare const window: any;

(async function () {
	// create workbench
	let config: IWorkbenchConstructionOptions & { folderUri?: UriComponents, workspaceUri?: UriComponents } = {};

	if (window.product) {
		config = window.product;
	} else {
		const result = await fetch('/product.json');
		config = await result.json();
	}


	if (Array.isArray(config.staticExtensions)) {
		config.staticExtensions.forEach(extension => {
			extension.extensionLocation = URI.revive(extension.extensionLocation);
		});
	}

	let workspace;
	if (config.folderUri) {
		workspace = { folderUri: URI.revive(config.folderUri) };
	} else if (config.workspaceUri) {
		workspace = { workspaceUri: URI.revive(config.workspaceUri) };
	} else {
		workspace = undefined;
	}

	if (workspace) {
		const workspaceProvider: IWorkspaceProvider = { 
			workspace,
			open: async (workspace: IWorkspace, options?: { reuse?: boolean, payload?: object }) => true,
			trusted: true 
		}
		config = { ...config, workspaceProvider };
	}

	create(document.body, config);
})();

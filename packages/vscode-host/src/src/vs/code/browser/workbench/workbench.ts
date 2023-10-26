import { Event } from "vs/base/common/event";
import { localize } from "vs/nls";
import { create } from "vs/workbench/workbench.web.main";

import {
  CommandId,
  ethViewerCommands,
  getCommands,
} from "../../../deth/commands/getCommands";
import { patchForWorkingInIframe } from "../../../deth/in-iframe/patchForWorkingInIframe";

async function main() {
  patchForWorkingInIframe();

  const config = getProductInfo();

  const apiName = ethViewerCommands.getApiName() || "etherscan";

  create(document.body, {
    ...config,
    settingsSyncOptions: {
      enabled: false,
    },
    commands: getCommands(),
    configurationDefaults: {
      "window.commandCenter": false,
      "workbench.colorTheme": "Default Dark Modern",
      "telemetry.enableTelemetry": false,
      // Omits ${rootName} "Untitled (Workspace)" from the title
      "window.title":
        "${dirty}${activeEditorShort}${separator}${appName}${separator}${remoteName}",
    },
    windowIndicator: {
      onDidChange: Event.None,
      label: localize("playgroundLabel", `$(remote) ${apiName}.deth.net`),
      tooltip: localize("playgroundTooltip", "See DethCode on GitHub"),
      command: CommandId("openRepoOnGithub"),
    },
  });

  const bannerKey = "banner-welcome#4-tmp";
  const bannerBody = `Say hello to the new, improved DethCode!`

  if (localStorage.getItem(bannerKey)) {
    // do nothing, user dismissed the banner already
    return;
  }

  const bannerDiv = document.createElement("div");
  bannerDiv.id = "deth-code-banner";
  bannerDiv.innerHTML = `
  <div style="width: 100%; color: #ff34f0; background-color: black; display: flex; justify-content: space-between; align-items: center; line-height: 24px;font-size: 14px;font-family: Roboto, Arial, sans-serif;">
    <div></div>
    <div>${bannerBody}</div>
    <a onclick="(() => { document.getElementById('${bannerDiv.id}').remove(); localStorage.setItem('${bannerKey}', true); return false; })();" style="padding:0 10px">x</a>
  </div>`
  document.body.prepend(bannerDiv);
}


type Mutable<T> = {
  -readonly [K in keyof T]: Mutable<T[K]>;
}
type ProductInfoType = Mutable<ReturnType<typeof getProductionProductInfo>>;

function getProductInfo(): ProductInfoType {
  if (location.protocol === "https:") {
    return getProductionProductInfo() as any
  } else {
    return getDevelopmentProductInfo() as any
  }
}

function getProductionProductInfo() {
  return {
    "productConfiguration": {
      "nameShort": "DethCode",
      "nameLong": "DethCode",
      "applicationName": "deth-viewer",
      "dataFolderName": ".deth-viewer",
      "version": "1.82.0",
      "extensionEnabledApiProposals": {
        "deth.ethereum-viewer": ["fileSearchProvider", "textSearchProvider"]
      }
    },
    "additionalBuiltinExtensions": [
      {
        "scheme": "https",
        "path": "/extensions/solidity-extension"
      },
      {
        "scheme": "https",
        "path": "/extensions/vyper-syntax"
      },
      {
        "scheme": "https",
        "path": "/extensions/ethereum-viewer"
      }
    ]
  } as const
}

function getDevelopmentProductInfo() {
  return {
    "productConfiguration": {
      "nameShort": "DethCode",
      "nameLong": "DethCode",
      "applicationName": "deth-viewer",
      "dataFolderName": ".deth-viewer",
      "version": "1.82.0",
      "extensionEnabledApiProposals": {
        "deth.ethereum-viewer": ["fileSearchProvider", "textSearchProvider"]
      }
    },
    "additionalBuiltinExtensions": [
      {
        "scheme": "http",
        "path": "/static/extensions/0/solidity-extension"
      },
      {
        "scheme": "http",
        "path": "/static/extensions/0/vyper-syntax"
      },
      {
        "scheme": "http",
        "path": "/static/extensions/0/ethereum-viewer"
      }
    ]
  } as const
}

main().catch((e) => {
  console.error("Error while workbench initialization", e)
});

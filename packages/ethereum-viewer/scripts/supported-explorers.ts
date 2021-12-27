import { apiUrlToWebsite } from "../src/explorer/apiUrlToWebsite";
import { explorerApiUrls } from "../src/explorer/networks";

function printSupportedExplorers() {
  console.log(
    "\n" +
      Object.values(explorerApiUrls)
        .map((url) => {
          const websiteUrl = apiUrlToWebsite(url);
          const label = websiteUrl.replace(/^https?:\/\//, "");
          return `- [${label}](${websiteUrl})`;
        })
        .join("\n") +
      "\n"
  );
}

if (require.main === module) printSupportedExplorers();

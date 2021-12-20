/**
 * mapping from Ethereum Code Viewer subdomain to Etherscan-like API URL
 */
export const networkApiUrls = {
  etherscan: "https://api.etherscan.io/api",
  "ropsten.etherscan": "https://api-ropsten.etherscan.io/api",
  "rinkeby.etherscan": "https://api-rinkeby.etherscan.io/api",
  "goerli.etherscan": "https://api-goerli.etherscan.io/api",
  "kovan.etherscan": "https://api-kovan.etherscan.io/api",
  bscscan: "https://api.bscscan.com/api",
  "testnet.bscscan": "https://api-testnet.bscscan.com/api",
  hecoinfo: "https://api.hecoinfo.com/api",
  "testnet.hecoinfo": "https://api-testnet.hecoinfo.com/api",
  ftmscan: "https://api.ftmscan.com/api",
  "testnet.ftmscan": "https://api-testnet.ftmscan.com/api",
  "optimistic.etherscan": "https://api-optimistic.etherscan.io/api",
  "kovan-optimistic.etherscan": "https://api-kovan-optimistic.etherscan.io/api",
  polygonscan: "https://api.polygonscan.com/api",
  "testnet.polygonscan": "https://api-testnet.polygonscan.com/api",
  arbiscan: "https://api.arbiscan.io/api",
  "testnet.arbiscan": "https://api-testnet.arbiscan.io/api",
  snowtrace: "https://api.snowtrace.io/api",
  "testnet.snowtrace": "https://api-testnet.snowtrace.io/api",
};

/**
 * subdomain of ethereum code viewer
 */
export type ApiName = keyof typeof networkApiUrls;

/**
 * mapping from Ethereum Code Viewer subdomain to memfs root directory name
 */
export const networkNames = {
  etherscan: "mainnet",
  "ropsten.etherscan": "ropsten",
  "rinkeby.etherscan": "rinkeby",
  "goerli.etherscan": "goerli",
  "kovan.etherscan": "kovan",
  bscscan: "bsc",
  "testnet.bscscan": "bscTestnet",
  hecoinfo: "heco",
  "testnet.hecoinfo": "hecoTestnet",
  ftmscan: "opera",
  "testnet.ftmscan": "ftmTestnet",
  "optimistic.etherscan": "optimism",
  "kovan-optimistic.etherscan": "optimismKovan",
  polygonscan: "polygon",
  "testnet.polygonscan": "polygonMumbai",
  arbiscan: "arbitrumOne",
  "testnet.arbiscan": "arbitrumTestnet",
  snowtrace: "avalanche",
  "testnet.snowtrace": "fuji",
} as const;

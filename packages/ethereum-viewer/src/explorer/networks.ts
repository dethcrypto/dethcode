/**
 * mapping from DethCode subdomain to Etherscan-like API URL
 */
export const explorerApiUrls = {
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
  cronoscan: "https://api.cronoscan.com/api",
  basescan: "https://api.basescan.org/api",
  "goerli.basescan": "https://api-goerli.basescan.org/",
};

/**
 * subdomain of DethCode
 */
export type ApiName = keyof typeof explorerApiUrls;

/**
 * mapping from DethCode subdomain to memfs root directory name
 */
export const networkNames: Record<ApiName, string> = {
  etherscan: "mainnet",
  "ropsten.etherscan": "ropsten",
  "rinkeby.etherscan": "rinkeby",
  "goerli.etherscan": "goerli",
  "kovan.etherscan": "kovan",
  bscscan: "bsc",
  "testnet.bscscan": "bscTestnet",
  hecoinfo: "heco",
  "testnet.hecoinfo": "hecoTestnet",
  ftmscan: "fantom",
  "testnet.ftmscan": "ftmTestnet",
  "optimistic.etherscan": "optimism",
  "kovan-optimistic.etherscan": "optimismKovan",
  polygonscan: "polygon",
  "testnet.polygonscan": "polygonMumbai",
  arbiscan: "arbitrumOne",
  "testnet.arbiscan": "arbitrumTestnet",
  snowtrace: "avalanche",
  "testnet.snowtrace": "avalancheTestnet",
  cronoscan: "cronos",
  basescan: "basescan",
  "goerli.basescan": "basescanGoerli",
};

const ETHERSCAN_KEY = "862Y3WJ4JB4B34PZQRFEV3IK6SZ8GNR9N5";
const OPTIMISM_KEY = "UF822UT1YY28J5EHFFIKI5SPN8752AC7VV";
const BSCSCAN_KEY = "HFUM7BBA5MRUQCN5UMEQPUZBUPPRHIQT3Y";
const FTMSCAN_KEY = "EH9NPZVF1HMNAQMAUZKA4VF7EC23X37DGS";
const HECOINFO_KEY = "XEUTJF2439EP4HHD23H2AFEFQJHFGSG57R";
const SNOWTRACE_KEY = "IQEHAJ43W674REN5XV79WF47X37VEB8PIC";
const ARBISCAN_KEY = "X3ZWJBXC14HTIR3B9DNYGEUICEIKKZ9ENZ";
const POLYGONSCAN_KEY = "RV4YXDXEMIHXMC7ZXB8T82G4F56FRZ1SZQ";
const CRONOSCAN_KEY = "BGAN1CWT8E1A2XRS3FU61UP7XXFMHBWNSY";
const BASESCAN_KEY = "ICQQDUA1C8R2EZY6M4QIIV7WUEZM8INNA7";

// @todo this should be possible to override using VSCode settings
export const explorerApiKeys: Record<ApiName, string> = {
  etherscan: ETHERSCAN_KEY,
  "ropsten.etherscan": ETHERSCAN_KEY,
  "rinkeby.etherscan": ETHERSCAN_KEY,
  "goerli.etherscan": ETHERSCAN_KEY,
  "kovan.etherscan": ETHERSCAN_KEY,

  "optimistic.etherscan": OPTIMISM_KEY,
  "kovan-optimistic.etherscan": OPTIMISM_KEY,

  arbiscan: ARBISCAN_KEY,
  "testnet.arbiscan": ARBISCAN_KEY,

  bscscan: BSCSCAN_KEY,
  "testnet.bscscan": BSCSCAN_KEY,

  ftmscan: FTMSCAN_KEY,
  "testnet.ftmscan": FTMSCAN_KEY,

  hecoinfo: HECOINFO_KEY,
  "testnet.hecoinfo": HECOINFO_KEY,

  polygonscan: POLYGONSCAN_KEY,
  "testnet.polygonscan": POLYGONSCAN_KEY,

  snowtrace: SNOWTRACE_KEY,
  "testnet.snowtrace": SNOWTRACE_KEY,

  cronoscan: CRONOSCAN_KEY,

  basescan: BASESCAN_KEY,
  "goerli.basescan": BASESCAN_KEY,
};

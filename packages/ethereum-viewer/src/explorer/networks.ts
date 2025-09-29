/**
 * mapping from DethCode subdomain to Etherscan-like API URL
 */
export const explorerApiUrls = {
  etherscan: "https://api.etherscan.io/v2/api?chainid=1",
  "sepolia.etherscan": "https://api-sepolia.etherscan.io/api",
  "holesky.etherscan": "https://api-holesky.etherscan.io/api",
  bscscan: "https://api.etherscan.io/v2/api?chainid=56",
  "testnet.bscscan": "https://api-testnet.bscscan.com/api",
  hecoinfo: "https://api.hecoinfo.com/api",
  "testnet.hecoinfo": "https://api-testnet.hecoinfo.com/api",
  ftmscan: "https://api.ftmscan.com/api",
  "testnet.ftmscan": "https://api-testnet.ftmscan.com/api",
  "optimistic.etherscan": "https://api.etherscan.io/v2/api?chainid=10",
  "sepolia-optimistic.etherscan":
    "https://api-sepolia-optimistic.etherscan.io/api",
  polygonscan: "https://api.etherscan.io/v2/api?chainid=137",
  "testnet.polygonscan": "https://api-testnet.polygonscan.com/api",
  arbiscan: "https://api.etherscan.io/v2/api?chainid=42161",
  "sepolia.arbiscan": "https://api-sepolia.arbiscan.io/api",
  snowtrace: "https://api.snowtrace.io/api",
  "testnet.snowtrace": "https://api-testnet.snowtrace.io/api",
  cronoscan: "https://api.cronoscan.com/api",
  basescan: "https://api.etherscan.io/v2/api?chainid=8453",
  "sepolia.basescan": "https://api-sepolia.basescan.org/api",
  gnosisscan: "https://api.etherscan.io/v2/api?chainid=100",
  fraxscan: "https://api.etherscan.io/v2/api?chainid=252",
  "holesky.fraxscan": "https://api-holesky.fraxscan.com/api",
  blastscan: "https://api.etherscan.io/v2/api?chainid=81457",
  "sepolia.blastscan": "https://api-sepolia.blastscan.io/api",
  sonicscan: "https://api.etherscan.io/v2/api?chainid=146",
  "testnet.sonicscan": "https://api-testnet.sonicscan.org/api",
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
  "sepolia.etherscan": "sepolia",
  "holesky.etherscan": "holesky",
  bscscan: "bsc",
  "testnet.bscscan": "bscTestnet",
  hecoinfo: "heco",
  "testnet.hecoinfo": "hecoTestnet",
  ftmscan: "fantom",
  "testnet.ftmscan": "ftmTestnet",
  "optimistic.etherscan": "optimism",
  "sepolia-optimistic.etherscan": "optimismSepolia",
  polygonscan: "polygon",
  "testnet.polygonscan": "polygonMumbai",
  arbiscan: "arbitrumOne",
  "sepolia.arbiscan": "arbitrumSepolia",
  snowtrace: "avalanche",
  "testnet.snowtrace": "avalancheTestnet",
  cronoscan: "cronos",
  basescan: "basescan",
  "sepolia.basescan": "basescanSepolia",
  gnosisscan: "gnosisscan",
  fraxscan: "frax",
  "holesky.fraxscan": "fraxHolesky",
  blastscan: "blast",
  "sepolia.blastscan": "blastSepolia",
  sonicscan: "sonic",
  "testnet.sonicscan": "sonicTestnet",
};

const ETHERSCAN_KEY = "P1JB3MQB5BB92A6K4C48HZKMCK7R8TIWIH";
const OPTIMISM_KEY = "UF822UT1YY28J5EHFFIKI5SPN8752AC7VV";
const BSCSCAN_KEY = "HFUM7BBA5MRUQCN5UMEQPUZBUPPRHIQT3Y";
const FTMSCAN_KEY = "EH9NPZVF1HMNAQMAUZKA4VF7EC23X37DGS";
const HECOINFO_KEY = "XEUTJF2439EP4HHD23H2AFEFQJHFGSG57R";
const SNOWTRACE_KEY = "IQEHAJ43W674REN5XV79WF47X37VEB8PIC";
const ARBISCAN_KEY = "X3ZWJBXC14HTIR3B9DNYGEUICEIKKZ9ENZ";
const POLYGONSCAN_KEY = "RV4YXDXEMIHXMC7ZXB8T82G4F56FRZ1SZQ";
const CRONOSCAN_KEY = "BGAN1CWT8E1A2XRS3FU61UP7XXFMHBWNSY";
const BASESCAN_KEY = "ICQQDUA1C8R2EZY6M4QIIV7WUEZM8INNA7";
const GNOSISSCAN_KEY = "7PWN1FIPXW6WDSGH3PIHRW1EEU4A882QSQ";
const FRAXSCAN_KEY = "TEUJWRCAKIXQCUR7XZRKCFRH3QHH344PAM";
const BLASTSCAN_KEY = "G6DR1ZFYP54GG49SJ9GID37SFQPV96H77E";
const SONICSCAN_KEY = "QTH3YA3WFHJH76EV6KWN2PQTDJKA85PN4D";

// @todo this should be possible to override using VSCode settings
export const explorerApiKeys: Record<ApiName, string> = {
  etherscan: ETHERSCAN_KEY,
  "sepolia.etherscan": ETHERSCAN_KEY,
  "holesky.etherscan": ETHERSCAN_KEY,

  "optimistic.etherscan": ETHERSCAN_KEY,
  "sepolia-optimistic.etherscan": OPTIMISM_KEY,

  arbiscan: ETHERSCAN_KEY,
  "sepolia.arbiscan": ARBISCAN_KEY,

  bscscan: ETHERSCAN_KEY,
  "testnet.bscscan": BSCSCAN_KEY,

  ftmscan: FTMSCAN_KEY,
  "testnet.ftmscan": FTMSCAN_KEY,

  hecoinfo: HECOINFO_KEY,
  "testnet.hecoinfo": HECOINFO_KEY,

  polygonscan: ETHERSCAN_KEY,
  "testnet.polygonscan": POLYGONSCAN_KEY,

  snowtrace: SNOWTRACE_KEY,
  "testnet.snowtrace": SNOWTRACE_KEY,

  cronoscan: CRONOSCAN_KEY,

  basescan: ETHERSCAN_KEY,
  "sepolia.basescan": BASESCAN_KEY,

  gnosisscan: ETHERSCAN_KEY,

  fraxscan: ETHERSCAN_KEY,
  "holesky.fraxscan": FRAXSCAN_KEY,

  blastscan: ETHERSCAN_KEY,
  "sepolia.blastscan": BLASTSCAN_KEY,

  sonicscan: ETHERSCAN_KEY,
  "testnet.sonicscan": SONICSCAN_KEY,
};

# Solidity Oracle

A simple Bitcoin price oracle that fetches the BTC/USD price from multiple sources (CoinMarketCap and CoinGecko), calculates the average, and stores it in a Solidity smart contract using viem.

## Project Structure

```
solidity-oracle/
├── src/
│   └── PriceOracle.sol    # Smart contract for storing price
├── oracle.js              # Node.js script to fetch and set price
├── .env.example           # Environment variables template
└── foundry.toml           # Foundry configuration
```

## Prerequisites

- [Foundry](https://book.getfoundry.sh/getting-started/installation) (for smart contract compilation and deployment)
- [Node.js](https://nodejs.org/) (v18 or higher)
- [CoinMarketCap API Key](https://coinmarketcap.com/api/) (optional, free tier available)

## Installation

1. Install Node.js dependencies:
   ```bash
   npm install
   ```

2. Build the smart contract:
   ```bash
   forge build
   ```

## Configuration

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` with your values:
   ```
   COINMARKETCAP_API_KEY=your-api-key-here
   PRIVATE_KEY=0xyour-private-key-here
   CONTRACT_ADDRESS=0xyour-contract-address-here
   RPC_URL=http://127.0.0.1:8545
   ```

   | Variable | Description |
   |----------|-------------|
   | `COINMARKETCAP_API_KEY` | Your CoinMarketCap API key (optional - CoinGecko is used as fallback) |
   | `PRIVATE_KEY` | Private key of the wallet that will send transactions (with 0x prefix) |
   | `CONTRACT_ADDRESS` | Address of the deployed PriceOracle contract |
   | `RPC_URL` | RPC endpoint (defaults to local Anvil node) |

## Price Sources

The oracle fetches prices from multiple sources and calculates the average:

| Source | API Key Required |
|--------|------------------|
| CoinMarketCap | Yes (optional) |
| CoinGecko | No (free) |

- If CoinMarketCap API key is provided, both sources are used and averaged
- If no API key is provided, only CoinGecko is used
- If one source fails, the oracle continues with the remaining source(s)

## Usage

### 1. Start a Local Node (for testing)

```bash
anvil
```

This starts a local Ethereum node with pre-funded test accounts.

### 2. Deploy the Contract

```bash
forge create src/PriceOracle.sol:PriceOracle \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
  --rpc-url http://127.0.0.1:8545
```

Note: The private key above is Anvil's default test account. Copy the deployed contract address to your `.env` file.

### 3. Run the Oracle

```bash
npm run oracle
```

This will:
1. Fetch the current BTC/USD price from CoinMarketCap and CoinGecko
2. Calculate the average price
3. Set the price in the smart contract
4. Output the transaction hash and confirmation

Example output:
```
CoinMarketCap price: $97234.56
CoinGecko price: $97198.42

Sources used: CoinMarketCap, CoinGecko
Average BTC price: $97216.49
Price in contract format (8 decimals): 9721649000000
Current contract price: 0
Transaction hash: 0x...
Transaction confirmed in block 1
New contract price: 9721649000000
Oracle update complete
```

## Smart Contract

### PriceOracle.sol

| Function | Description |
|----------|-------------|
| `setPrice(uint256 _price)` | Sets the price value |
| `getPrice()` | Returns the current price |

### Price Format

The price is stored with 8 decimal places:
- BTC price of `$97,234.56789012` is stored as `9723456789012`
- To convert back: divide by `10^8`

### Events

- `PriceUpdated(uint256 oldPrice, uint256 newPrice)` - Emitted when price is updated

## Testing the Contract

```bash
forge test
```

## Networks

To use on different networks, update `RPC_URL` in your `.env` file:

| Network | RPC URL |
|---------|---------|
| Local (Anvil) | `http://127.0.0.1:8545` |
| Ethereum Mainnet | `https://eth.llamarpc.com` |
| Sepolia Testnet | `https://rpc.sepolia.org` |
| Polygon | `https://polygon-rpc.com` |

## License

MIT

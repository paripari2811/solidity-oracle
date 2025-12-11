# Solidity Oracle

A simple oracle that generates a random value and stores it in a Solidity smart contract using viem.

## Project Structure

```
solidity-oracle/
├── src/
│   └── PriceOracle.sol    # Smart contract for storing value
├── oracle.js              # Node.js script to generate and set random value
├── .env.example           # Environment variables template
└── foundry.toml           # Foundry configuration
```

## Prerequisites

- [Foundry](https://book.getfoundry.sh/getting-started/installation) (for smart contract compilation and deployment)
- [Node.js](https://nodejs.org/) (v18 or higher)

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
   PRIVATE_KEY=0xyour-private-key-here
   CONTRACT_ADDRESS=0xyour-contract-address-here
   RPC_URL=http://127.0.0.1:8545
   ```

   | Variable | Description |
   |----------|-------------|
   | `PRIVATE_KEY` | Private key of the wallet that will send transactions (with 0x prefix) |
   | `CONTRACT_ADDRESS` | Address of the deployed PriceOracle contract |
   | `RPC_URL` | RPC endpoint (defaults to local Anvil node) |

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
1. Generate a random value (between 1 and 1,000,000)
2. Set the value in the smart contract
3. Output the transaction hash and confirmation

Example output:
```
Generated random value: 548721
Current contract value: 0
Transaction hash: 0x...
Transaction confirmed in block 1
New contract value: 548721
Oracle update complete
```

## Smart Contract

### PriceOracle.sol

| Function | Description |
|----------|-------------|
| `setValue(uint256 _value)` | Sets the value |
| `getValue()` | Returns the current value |

### Events

- `ValueUpdated(uint256 oldValue, uint256 newValue)` - Emitted when value is updated

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

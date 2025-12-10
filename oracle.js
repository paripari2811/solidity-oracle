import { createPublicClient, createWalletClient, http, parseUnits } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { localhost } from 'viem/chains';
import 'dotenv/config';

// Contract ABI (only the functions we need)
const abi = [
  {
    type: 'function',
    name: 'getPrice',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'setPrice',
    inputs: [{ name: '_price', type: 'uint256' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
];

// Configuration from environment variables
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const RPC_URL = process.env.RPC_URL || 'http://127.0.0.1:8545';

// Fetch Bitcoin price from CoinMarketCap
async function getBitcoinPriceFromCoinMarketCap() {
  const url = 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest';

  const response = await fetch(`${url}?symbol=BTC&convert=USD`, {
    headers: {
      'X-CMC_PRO_API_KEY': COINMARKETCAP_API_KEY,
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`CoinMarketCap API error: ${response.statusText}`);
  }

  const data = await response.json();
  const price = data.data.BTC.quote.USD.price;

  return price;
}

// Fetch Bitcoin price from CoinGecko (free, no API key required)
async function getBitcoinPriceFromCoinGecko() {
  const url = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd';

  const response = await fetch(url, {
    headers: {
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`CoinGecko API error: ${response.statusText}`);
  }

  const data = await response.json();
  const price = data.bitcoin.usd;

  return price;
}

// Get average Bitcoin price from both sources
async function getAverageBitcoinPrice() {
  const prices = [];
  const sources = [];

  // Try CoinMarketCap
  if (COINMARKETCAP_API_KEY) {
    try {
      const cmcPrice = await getBitcoinPriceFromCoinMarketCap();
      prices.push(cmcPrice);
      sources.push({ name: 'CoinMarketCap', price: cmcPrice });
      console.log(`CoinMarketCap price: $${cmcPrice.toFixed(2)}`);
    } catch (error) {
      console.warn(`Failed to fetch from CoinMarketCap: ${error.message}`);
    }
  } else {
    console.log('CoinMarketCap API key not provided, skipping...');
  }

  // Try CoinGecko
  try {
    const geckoPrice = await getBitcoinPriceFromCoinGecko();
    prices.push(geckoPrice);
    sources.push({ name: 'CoinGecko', price: geckoPrice });
    console.log(`CoinGecko price: $${geckoPrice.toFixed(2)}`);
  } catch (error) {
    console.warn(`Failed to fetch from CoinGecko: ${error.message}`);
  }

  if (prices.length === 0) {
    throw new Error('Failed to fetch price from any source');
  }

  // Calculate average
  const averagePrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;

  console.log(`\nSources used: ${sources.map(s => s.name).join(', ')}`);
  console.log(`Average BTC price: $${averagePrice.toFixed(2)}`);

  return averagePrice;
}

// Main oracle function
async function updateOraclePrice() {
  // Validate environment variables
  if (!PRIVATE_KEY) {
    throw new Error('PRIVATE_KEY is required in .env file');
  }
  if (!CONTRACT_ADDRESS) {
    throw new Error('CONTRACT_ADDRESS is required in .env file');
  }

  // Create account from private key
  const account = privateKeyToAccount(PRIVATE_KEY);

  // Create clients
  const publicClient = createPublicClient({
    chain: localhost,
    transport: http(RPC_URL),
  });

  const walletClient = createWalletClient({
    account,
    chain: localhost,
    transport: http(RPC_URL),
  });

  try {
    // Get average price from multiple sources
    const btcPrice = await getAverageBitcoinPrice();

    // Convert price to uint256 (multiply by 10^8 to preserve 8 decimal places)
    const priceInWei = parseUnits(btcPrice.toFixed(8), 8);
    console.log(`Price in contract format (8 decimals): ${priceInWei}`);

    // Get current price from contract
    const currentContractPrice = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi,
      functionName: 'getPrice',
    });
    console.log(`Current contract price: ${currentContractPrice}`);

    // Set new price in contract
    const hash = await walletClient.writeContract({
      address: CONTRACT_ADDRESS,
      abi,
      functionName: 'setPrice',
      args: [priceInWei],
    });

    console.log(`Transaction hash: ${hash}`);

    // Wait for transaction confirmation
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    console.log(`Transaction confirmed in block ${receipt.blockNumber}`);

    // Verify the new price
    const newContractPrice = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi,
      functionName: 'getPrice',
    });
    console.log(`New contract price: ${newContractPrice}`);

  } catch (error) {
    console.error('Error updating oracle price:', error.message);
    throw error;
  }
}

// Run the oracle
updateOraclePrice()
  .then(() => {
    console.log('Oracle update complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Oracle update failed:', error);
    process.exit(1);
  });

import { createPublicClient, createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { localhost } from 'viem/chains';
import 'dotenv/config';

// Contract ABI (only the functions we need)
const abi = [
  {
    type: 'function',
    name: 'getValue',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'setValue',
    inputs: [{ name: '_value', type: 'uint256' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
];

// Configuration from environment variables
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const RPC_URL = process.env.RPC_URL || 'http://127.0.0.1:8545';

// Generate a random value between min and max
function generateRandomValue(min = 1, max = 1000000) {
  return BigInt(Math.floor(Math.random() * (max - min + 1)) + min);
}

// Main oracle function
async function updateOracleValue() {
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
    // Generate random value
    const randomValue = generateRandomValue();
    console.log(`Generated random value: ${randomValue}`);

    // Get current value from contract
    const currentContractValue = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi,
      functionName: 'getValue',
    });
    console.log(`Current contract value: ${currentContractValue}`);

    // Set new value in contract
    const hash = await walletClient.writeContract({
      address: CONTRACT_ADDRESS,
      abi,
      functionName: 'setValue',
      args: [randomValue],
    });

    console.log(`Transaction hash: ${hash}`);

    // Wait for transaction confirmation
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    console.log(`Transaction confirmed in block ${receipt.blockNumber}`);

    // Verify the new value
    const newContractValue = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi,
      functionName: 'getValue',
    });
    console.log(`New contract value: ${newContractValue}`);

  } catch (error) {
    console.error('Error updating oracle value:', error.message);
    throw error;
  }
}

// Run the oracle
updateOracleValue()
  .then(() => {
    console.log('Oracle update complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Oracle update failed:', error);
    process.exit(1);
  });

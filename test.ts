import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { getNetworkConfig, IkaClient, IkaTransaction } from '@ika.xyz/sdk';

async function main() {
  const suiClient = new SuiClient({ url: getFullnodeUrl('testnet') });
  const ikaClient = new IkaClient({
    suiClient,
    config: getNetworkConfig('testnet'),
    network: 'testnet',
  });

  await ikaClient.initialize();

  const tx = new Transaction();
  const ikaTx = new IkaTransaction({ ikaClient, transaction: tx });

  console.log('Ika SDK успешно инициализирован и готов к работе!');
}

main().catch(console.error);

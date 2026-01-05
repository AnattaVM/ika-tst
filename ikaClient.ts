import { IkaClient } from "@ika.xyz/sdk";
import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";

export const suiClient = new SuiClient({
  url: getFullnodeUrl("testnet"),
});

export const ikaClient = new IkaClient({
  network: "testnet",
  suiClient,
});

console.log("IKA client initialized on SUI testnet");

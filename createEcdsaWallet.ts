import { execSync } from "node:child_process";

const cmd = `
sui client call \
  --package 0xIKA_PACKAGE_ID \
  --module dwallet \
  --function create_secp256k1 \
  --gas-budget 10000000
`;

console.log("Creating ECDSA dWallet...");
execSync(cmd, { stdio: "inherit" });



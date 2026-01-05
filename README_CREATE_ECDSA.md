# ECDSA Wallet Scripts — English / Русский

This document explains two utility scripts included in this repository:

- `createEcdsaWalletSdk.ts` — attempts to create an ECDSA (secp256k1) dWallet via the IKA SDK.
- `extractDWalletPublicKey.ts` — extracts a `public_key` from a DWallet JSON object and derives the Ethereum address (keccak256 of uncompressed public key).

---

**English**

## Overview

1) `createEcdsaWalletSdk.ts` probes the exported `ikaClient` object for common wallet-creation methods (for example `dwallet.create`, `dwallet.create_secp256k1`, `createEcdsaWallet`, etc.). It calls the first available method with conservative options and prints the result. This is a safe "probe-and-call" helper to discover the correct SDK method in environments where the SDK surface may vary.

2) `extractDWalletPublicKey.ts` is a small CLI that accepts a JSON DWallet object (file path or stdin), finds a `public_key` field (common keys: `public_key`, `publicKey`, `pubkey`, `pub_key`), decodes hex (0x-prefixed or raw hex), or base64, normalizes the public key, decompresses compressed secp256k1 keys if needed, computes keccak256 over the uncompressed X||Y and outputs the Ethereum address (last 20 bytes).

## Prerequisites

- Node.js and `pnpm` installed.
- Run from repository root.
- Install dependencies added to `package.json`:

```bash
pnpm install
```

## Usage examples

Run the SDK probe script (safe; it may exit with a message if no suitable method found):

```bash
pnpm exec tsx createEcdsaWalletSdk.ts
```

Extract public key and compute Ethereum address from a JSON file:

```bash
pnpm exec tsx extractDWalletPublicKey.ts path/to/dwallet.json
```

Or via stdin:

```bash
cat path/to/dwallet.json | pnpm exec tsx extractDWalletPublicKey.ts -
```

Example output from `extractDWalletPublicKey.ts`:

- `public_key (hex): 0x04...` — normalized public key in hex
- `ethereum_address: 0x...` — 20-byte Ethereum address (lowercase hex)

## Supported encodings and key formats

- Hex (with or without `0x`)
- Base64
- Public key lengths accepted:
  - 33 bytes (compressed secp256k1) — script will decompress
  - 65 bytes (0x04 + X||Y) — accepted directly
  - 64 bytes (X||Y) — accepted and prefixed with `0x04`

If the key encoding or length is unsupported the script exits with an error.

## Security notes

- These scripts do not and must not leak private keys. `createEcdsaWalletSdk.ts` only probes SDK methods and prints SDK responses — review the SDK method's behavior before using in production.
- When creating wallets, ensure you control the signer and private key lifecycle — do not commit secrets into the repo.

## Troubleshooting

- If `createEcdsaWalletSdk.ts` cannot find a method, inspect `ikaClient.ts` and the real SDK surface. You may need to provide credentials or a signer there.
- If `extractDWalletPublicKey.ts` fails to decode the key, inspect the DWallet object structure and encoding.

---

**Русский**

## Обзор

1) `createEcdsaWalletSdk.ts` перебирает поля экспортируемого объекта `ikaClient` в поисках распространённых методов создания кошелька (например, `dwallet.create`, `dwallet.create_secp256k1`, `createEcdsaWallet` и т.д.). Скрипт вызывает найденный метод с внимательными дефолтными опциями и выводит результат. Это безопасный «probe-and-call» инструмент для быстрого определения подходящего метода SDK в окружениях с разными версиями SDK.

2) `extractDWalletPublicKey.ts` — CLI-утилита, принимающая JSON-объект DWallet (файл или stdin), ищет поле `public_key` (или аналоги `publicKey`, `pubkey`, `pub_key`), декодирует hex (с `0x` или без), либо base64, нормализует ключ, при необходимости распаковывает сжатый secp256k1 ключ и вычисляет адрес Ethereum как `keccak256(uncompressed_pubkey_x||y)` и берет последние 20 байт.

## Требования

- Node.js и `pnpm`.
- Запускать из корня репозитория.
- Установите зависимости:

```bash
pnpm install
```

## Примеры использования

Запуск скрипта, который пробует SDK (безопасно):

```bash
pnpm exec tsx createEcdsaWalletSdk.ts
```

Вычисление адреса Ethereum из JSON-файла DWallet:

```bash
pnpm exec tsx extractDWalletPublicKey.ts path/to/dwallet.json
```

Или через stdin:

```bash
cat path/to/dwallet.json | pnpm exec tsx extractDWalletPublicKey.ts -
```

Пример вывода `extractDWalletPublicKey.ts`:

- `public_key (hex): 0x04...` — публичный ключ в hex
- `ethereum_address: 0x...` — Ethereum-адрес (нижний регистр)

## Поддерживаемые форматы

- Hex (с `0x` или без)
- Base64
- Поддерживаемые длины ключа:
  - 33 байта — сжатый ключ (скрипт распакует)
  - 65 байт — несжатый ключ с префиксом `0x04`
  - 64 байта — X||Y (скрипт добавит префикс `0x04`)

Если кодировка или длина не распознаны — скрипт завершится с ошибкой.

## Безопасность

- Скрипты не должны раскрывать приватные ключи. `createEcdsaWalletSdk.ts` только вызывает методы SDK и печатает ответы — перед использованием в production проверьте, что делает конкретный метод SDK.
- При создании кошельков контролируйте цикл жизни приватных ключей — не сохраняйте секреты в репозитории.

## Отладка

- Если `createEcdsaWalletSdk.ts` не находит метод — откройте `ikaClient.ts` и проверьте экспортируемые свойства SDK, возможно требуется подставить signer или credentials.
- Если `extractDWalletPublicKey.ts` не декодирует ключ — проверьте структуру DWallet и кодировку поля `public_key`.

---

If you want, I can:

- update `extractDWalletPublicKey.ts` to print an EIP-55 checksummed address, or
- adapt `createEcdsaWalletSdk.ts` to call a specific SDK method if you provide the exact method name available in your `ikaClient`.


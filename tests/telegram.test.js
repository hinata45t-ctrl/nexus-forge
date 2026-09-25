# Nexus Forge

Nexus Forge is a modular multi-instance WhatsApp core with a Telegram control layer. The project keeps the Telegram interface separate from the actual WhatsApp logic and uses the Core API only.

## Architecture

- `src/core`: multi-instance lifecycle, configuration, and storage
- `src/whatsapp`: Baileys sockets, session isolation, and message handling
- `src/telegram`: Telegram manager and guided creation flow
- `src/commands`: command system for WhatsApp bot instances
- `instances/<instanceId>`: isolated runtime folder for each bot

## Installation

```bash
npm install
cp .env.example .env
npm test
npm start
```

## Environment

The following variables are expected in `.env`:

- `NODE_ENV`
- `LOG_LEVEL`
- `SESSION_ENCRYPTION_KEY`
- `TELEGRAM_BOT_TOKEN`
- `NEXUS_ADMIN_IDS`

Never commit real credentials or tokens.

## WhatsApp pairing flow

1. The Telegram user creates a bot instance.
2. The instance keeps `ownerNumber` and `botPhoneNumber` separate.
3. The Telegram manager calls the Core `startBot` and `pairBot` functions.
4. Baileys generates a temporary pairing code for the bot account.
5. The user enters the code in the target WhatsApp account.
6. The instance becomes `connected` and can answer simple commands.

## Core API used by Telegram

- `createBot()`
- `getBot()`
- `listBots()`
- `startBot()`
- `stopBot()`
- `restartBot()`
- `deleteBot()`
- `getBotStatus()`
- `pairBot()`
- `setMenuImage()`

## Available WhatsApp commands

- `!ping`
- `!menu`
- `!owner`
- `!help`

## Security

- User ownership is checked server-side before any bot action.
- Session files are never shared across instances.
- Secrets stay in `.env`, never inside instance JSON files.
- User IDs are used for Telegram ownership checks, not display names or usernames.

## Notes

This phase focuses on real Baileys connection, pairing, status tracking, and minimal WhatsApp command execution. Telegram is an interface over the Core; it does not replace the Core.

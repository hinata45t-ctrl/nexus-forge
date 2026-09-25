# Nexus Forge

Nexus Forge is a clean, modular core for managing independent WhatsApp bot instances with Node.js and Baileys. Each instance has its own configuration, socket, session, assets, data, and logs.

> Telegram is intentionally **not integrated yet**. The core exposes a clean internal API for the future `NexusForgeManagerBot`.

## Requirements

- Node.js 20+
- A Linux server is recommended for production

## Installation

```bash
npm install
cp .env.example .env
npm test
npm start
```

Starting the application only initializes the core; it does not create or connect instances automatically.

## Architecture

- `src/core`: instance lifecycle, configuration, runtime, and logging
- `src/whatsapp`: one Baileys socket and session per instance
- `src/commands`: isolated, prefix-aware command system
- `src/storage`: filesystem abstraction and instance paths
- `instances/<id>`: isolated runtime data for every bot
- `tests`: automated unit/integration tests using Node's built-in test runner

## Internal API

`src/index.js` exports `createNexusForge()`, which provides:

```js
const forge = createNexusForge();
const bot = await forge.createBot({
  botName: 'Alpha',
  ownerName: 'Baki',
  ownerNumber: '22611111111',
  developerName: 'Baki',
  prefix: '!',
});

await forge.startBot(bot.instanceId);
await forge.pairBot(bot.instanceId, '22611111111');
```

Available operations: `createBot`, `getBot`, `listBots`, `updateBot`, `startBot`, `stopBot`, `restartBot`, `deleteBot`, `getBotStatus`, and `pairBot`.

## Commands

The initial WhatsApp commands are `ping`, `menu`, `owner`, and `help`. Every command executes with a context containing `instanceId`, `config`, `socket`, `message`, `sender`, `chat`, and `prefix`.

## Security

Secrets belong in `.env`, never in an instance's `config.json`. WhatsApp sessions, logs, and runtime data are ignored by Git. Do not commit pairing credentials.

## Future work

Telegram will be added as a separate control interface above this core. Payments, subscriptions, Telegram handlers, keyboards, and databases are deliberately out of scope for this first stage.

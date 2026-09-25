# Nexus Forge

Nexus Forge is a modular multi-instance WhatsApp core with **NexusForgeManagerBot**, a Telegram control interface. Telegram calls the existing Core API; it does not contain WhatsApp business logic.

## Installation and configuration

```bash
npm install
cp .env.example .env
npm test
npm start
```

Set these values in `.env` locally:

- `TELEGRAM_BOT_TOKEN`: token supplied by BotFather. Never commit or log it.
- `NEXUS_ADMIN_IDS`: optional comma-separated Telegram user IDs for future administration.
- `LOG_LEVEL`, `NODE_ENV`, and the existing Core session settings.

If `TELEGRAM_BOT_TOKEN` is absent, the Core starts without launching Telegram.

## Telegram flow

`/start` opens the main menu. **Créer un bot** starts a per-user, expiring conversation:

1. bot name
2. menu photo or `/skip`
3. owner name
4. owner number
5. bot number (kept separate)
6. developer name
7. prefix
8. public mode (private mode is reserved for the next UI iteration)
9. summary and confirmation

The Core instance is created only after confirmation. Temporary photos live under `tmp/telegram/<telegramUserId>/<creationId>/`; ownership is recorded separately under `telegram-data/users.json`. The photo is transferred only after instance creation.

## Architecture

- `src/core`: existing lifecycle and configuration API
- `src/whatsapp`: existing Baileys sockets and sessions
- `src/telegram/bot.js`: Telegraf wiring and handlers
- `src/telegram/userStore.js`: Telegram ID to instance ownership
- `src/telegram/conversationStore.js`: isolated, expiring creation state
- `src/telegram/telegramUtils.js`: validation, photo handling, safe status output

The manager uses `createInstance`, `getInstance`, `setMenuImage`, `startInstance`, `stopInstance`, `restartInstance`, `deleteInstance`, and `getInstanceStatus` from the Core. It does not recreate or replace the Core.

## Security

Ownership is checked server-side for every management callback. Telegram usernames are never used as identity. Callback IDs are not trusted. User-facing errors are generic while technical details go to instance-aware logs. Temporary files use generated names and are removed on cancellation or expiration. Runtime Telegram data and credentials are ignored by Git.

## Available commands

- `/start`
- `/cancel`
- `/skip` during photo selection
- Inline buttons for creation, listing, starting, stopping, restarting, status, and deletion

Telegram administration, pairing UX, configuration editing, logs UI, payments, subscriptions, and web interfaces are intentionally out of scope for this phase.

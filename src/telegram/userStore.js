import { Telegraf, Markup } from 'telegraf';
import { TelegramUserStore } from './userStore.js';
import { ConversationStore } from './conversationStore.js';
import { normalizePhone, validPrefix, isAdmin, downloadTelegramPhoto, publicStatus } from './telegramUtils.js';

const mainKeyboard = () => Markup.inlineKeyboard([
  [Markup.button.callback('🤖 Créer un bot', 'create')],
  [Markup.button.callback('📦 Mes bots', 'bots')],
  [Markup.button.callback('⚙️ Paramètres', 'settings'), Markup.button.callback('ℹ️ Aide', 'help')],
]);

const cancelKeyboard = () => Markup.inlineKeyboard([
  [Markup.button.callback('❌ Annuler', 'cancel')],
]);

const idOf = ctx => Number(ctx.from?.id ?? 0);
const text = ctx => String(ctx.message?.text ?? '').trim();

const safe = async (ctx, operation, logger) => {
  try {
    return await operation();
  } catch (error) {
    logger.error({ error: error.message, telegramUserId: idOf(ctx) }, 'Telegram operation failed');
    await ctx.reply('❌ Une erreur est survenue.');
    return null;
  }
};

export function createTelegramBot({ forge, logger = forge.logger, userStore = new TelegramUserStore(), conversations = new ConversationStore() } = {}) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    logger.warn('TELEGRAM_BOT_TOKEN is not configured; Telegram manager disabled');
    return { launch: async () => {}, stop: () => {} };
  }

  const bot = new Telegraf(token);

  const start = async (ctx) => safe(ctx, async () => {
    await userStore.createUser(idOf(ctx));
    await ctx.reply('╭━━━〔 NEXUS FORGE 〕━━━╮\n│\n│ 🤖 Bienvenue sur Nexus Forge\n│\n│ Crée et gère tes bots WhatsApp\n│ directement depuis Telegram.\n│\n╰━━━━━━━━━━━━━━━━━━━━━━╯', mainKeyboard());
  }, logger);

  const beginCreation = async (ctx) => safe(ctx, async () => {
    await ctx.answerCbQuery?.();
    const state = await conversations.start(idOf(ctx));
    logger.info({ telegramUserId: idOf(ctx), creationId: state.creationId }, 'Telegram creation started');
    await ctx.reply('Quel nom veux-tu donner à ton bot WhatsApp ?', cancelKeyboard());
    conversations.update(idOf(ctx), { step: 'botName' });
  }, logger);

  const prompt = async (ctx, question, step) => {
    conversations.update(idOf(ctx), { step });
    await ctx.reply(question, cancelKeyboard());
  };

  const next = async (ctx) => safe(ctx, async () => {
    const id = idOf(ctx);
    const state = conversations.get(id);
    if (!state) return ctx.reply('Cette création a expiré. Recommence avec le bouton Créer un bot.');
    const value = text(ctx);

    if (state.step === 'botName') {
      if (!value || value.length > 80) throw new Error('Nom invalide');
      state.data.botName = value.trim();
      return prompt(ctx, 'Envoie la photo du menu, ou utilise /skip pour la photo par défaut.', 'photo');
    }

    if (state.step === 'ownerName') {
      if (!value || value.length > 80) throw new Error('Nom propriétaire invalide');
      state.data.ownerName = value.trim();
      return prompt(ctx, 'Quel est le numéro WhatsApp de l’owner ?', 'ownerNumber');
    }

    if (state.step === 'ownerNumber') {
      state.data.ownerNumber = normalizePhone(value);
      return prompt(ctx, 'Quel numéro WhatsApp veux-tu utiliser pour ton bot ?', 'botPhoneNumber');
    }

    if (state.step === 'botPhoneNumber') {
      state.data.botPhoneNumber = normalizePhone(value);
      return prompt(ctx, 'Quel nom afficher comme développeur ? (ou « même »)', 'developerName');
    }

    if (state.step === 'developerName') {
      state.data.developerName = value.toLowerCase() === 'même' ? state.data.ownerName : value.trim();
      if (!state.data.developerName) throw new Error('Développeur invalide');
      return prompt(ctx, 'Quel préfixe veux-tu utiliser ? (ex: !)', 'prefix');
    }

    if (state.step === 'prefix') {
      if (!validPrefix(value)) throw new Error('Préfixe invalide');
      state.data.prefix = value.trim();
      return summary(ctx, state);
    }
  }, logger);

  const photo = async (ctx) => safe(ctx, async () => {
    const id = idOf(ctx);
    const state = conversations.get(id);
    if (!state || state.step !== 'photo') return;
    state.data.photoPath = await downloadTelegramPhoto(ctx, id, conversations);
    await prompt(ctx, 'Quel nom doit être utilisé pour l’owner de ton bot ?', 'ownerName');
  }, logger);

  const skipPhoto = async (ctx) => safe(ctx, async () => {
    const state = conversations.get(idOf(ctx));
    if (!state) return;
    state.data.photoPath = null;
    await prompt(ctx, 'Quel nom doit être utilisé pour l’owner de ton bot ?', 'ownerName');
  }, logger);

  const summary = async (ctx, state = conversations.get(idOf(ctx))) => {
    await ctx.reply(`╭━━〔 CONFIGURATION 〕━━╮\n\n🤖 Nom : ${state.data.botName}\n👤 Owner : ${state.data.ownerName}\n📱 Numéro Owner : +${state.data.ownerNumber}\n📱 Numéro Bot : +${state.data.botPhoneNumber}\n👨‍💻 Développeur : ${state.data.developerName}\n🔧 Préfixe : ${state.data.prefix}\n🌍 Mode : Public\n🖼️ Photo : ${state.data.photoPath ? 'Personnalisée' : 'Par défaut'}\n\n╰━━━━━━━━━━━━━━━━━━━━━━╯\nTout est correct ?`, Markup.inlineKeyboard([
      [Markup.button.callback('✅ Créer le bot', 'confirm')],
      [Markup.button.callback('✏️ Modifier', 'edit'), Markup.button.callback('❌ Annuler', 'cancel')],
    ]));
  };

  const confirm = async (ctx) => safe(ctx, async () => {
    const state = conversations.get(idOf(ctx));
    if (!state) throw new Error('Création expirée');
    const created = await forge.createBot({
      botName: state.data.botName,
      ownerName: state.data.ownerName,
      ownerNumber: state.data.ownerNumber,
      botPhoneNumber: state.data.botPhoneNumber,
      developerName: state.data.developerName,
      prefix: state.data.prefix,
      mode: 'public',
      timezone: 'UTC',
    });

    if (state.data.photoPath) {
      await forge.setMenuImage(created.instanceId, state.data.photoPath);
    }

    await userStore.addInstanceToUser(idOf(ctx), created.instanceId);
    logger.info({ telegramUserId: idOf(ctx), instanceId: created.instanceId }, 'Telegram instance created');
    await conversations.cancel(idOf(ctx));

    await ctx.reply(`╭━━〔 BOT CRÉÉ 〕━━╮\n\n✅ Ton bot a été créé.\n\n🤖 Nom : ${state.data.botName}\n🆔 ID : ${created.instanceId}\n📱 Numéro : +${state.data.botPhoneNumber}\n📊 Statut : 🟡 Créé\n\n╰━━━━━━━━━━━━━━━━╯`, Markup.inlineKeyboard([
      [Markup.button.callback('📱 Connecter WhatsApp', `connect:${created.instanceId}`)],
      [Markup.button.callback('⚙️ Gérer le bot', `manage:${created.instanceId}`)],
      [Markup.button.callback('📦 Mes bots', 'bots')],
    ]));
  }, logger);

  const cancel = async (ctx) => safe(ctx, async () => {
    await conversations.cancel(idOf(ctx));
    await ctx.reply('Création annulée.', mainKeyboard());
  }, logger);

  const ensureOwned = async (ctx, instanceId) => {
    const userId = idOf(ctx);
    if (!instanceId || !(await userStore.ownsInstance(userId, instanceId))) {
      throw new Error('Tu n’as pas accès à ce bot.');
    }
    return instanceId;
  };

  const buildBotMenu = (instanceId) => Markup.inlineKeyboard([
    [Markup.button.callback('▶️ Démarrer', `start:${instanceId}`), Markup.button.callback('⏹️ Arrêter', `stop:${instanceId}`)],
    [Markup.button.callback('🔄 Redémarrer', `restart:${instanceId}`), Markup.button.callback('📊 Statut', `status:${instanceId}`)],
    [Markup.button.callback('📱 Connecter WhatsApp', `connect:${instanceId}`), Markup.button.callback('📜 Logs', `logs:${instanceId}`)],
    [Markup.button.callback('🗑️ Supprimer', `delete:${instanceId}`), Markup.button.callback('⬅️ Retour', 'bots')],
  ]);

  const openManageView = async (ctx, instanceId) => {
    const config = await forge.getBot(instanceId);
    const status = forge.getBotStatus(instanceId);
    await ctx.reply(`╭━━〔 ${config.botName} 〕━━╮\n\n🆔 ID : ${instanceId}\n📊 Statut : ${publicStatus(status)}\n\n╰━━━━━━━━━━━━━━━━━━━━╯`, buildBotMenu(instanceId));
  };

  const manage = async (ctx) => safe(ctx, async () => {
    const instanceId = await ensureOwned(ctx, ctx.match[1]);
    await openManageView(ctx, instanceId);
  }, logger);

  const bots = async (ctx) => safe(ctx, async () => {
    const ids = await userStore.getUserInstances(idOf(ctx));
    if (!ids.length) return ctx.reply('Tu n’as pas encore de bot.', mainKeyboard());

    const lines = [];
    for (const instanceId of ids) {
      const config = await forge.getBot(instanceId).catch(() => null);
      if (!config) continue;
      const status = publicStatus(forge.getBotStatus(instanceId));
      lines.push(`🤖 ${config.botName}\n${status}`);
    }

    await ctx.reply(`╭━━〔 MES BOTS 〕━━╮\n\n${lines.join('\n\n')}\n\n╰━━━━━━━━━━━━━━━━╯`, Markup.inlineKeyboard(ids.map(instanceId => [Markup.button.callback('⚙️ Gérer', `manage:${instanceId}`)])));
  }, logger);

  const connectInstance = async (ctx) => safe(ctx, async () => {
    const instanceId = await ensureOwned(ctx, ctx.match[1]);
    const config = await forge.getBot(instanceId);
    if (!config.botPhoneNumber) throw new Error('Numéro du bot manquant.');

    const status = forge.getBotStatus(instanceId);
    if (status === 'connected' || status === 'connecting') {
      await ctx.reply('ℹ️ Ce bot WhatsApp est déjà connecté.');
      return;
    }

    await forge.startBot(instanceId);
    const pairingCode = await forge.pairBot(instanceId, config.botPhoneNumber);

    await ctx.reply(`╭━━〔 CONNEXION WHATSAPP 〕━━╮\n\n🤖 Bot : ${config.botName}\n📱 Numéro : +${config.botPhoneNumber}\n⏳ Génération du code...\n\n╰━━━━━━━━━━━━━━━━━━━━━━━━━━╯`);

    if (pairingCode) {
      await ctx.reply(`╭━━〔 CODE DE PAIRING 〕━━╮\n\n🔐 Code : ${pairingCode}\n📱 Numéro : +${config.botPhoneNumber}\n\nUtilise ce code dans WhatsApp pour connecter ce compte.\n⏳ En attente de connexion...\n\n╰━━━━━━━━━━━━━━━━━━━━━━╯`, Markup.inlineKeyboard([
        [Markup.button.callback('🔄 Vérifier la connexion', `status:${instanceId}`)],
        [Markup.button.callback('❌ Annuler', `manage:${instanceId}`)],
      ]));
    }
  }, logger);

  const triggerStatus = async (ctx) => safe(ctx, async () => {
    const instanceId = await ensureOwned(ctx, ctx.match[1]);
    const status = forge.getBotStatus(instanceId);
    await ctx.answerCbQuery?.(publicStatus(status));
    await openManageView(ctx, instanceId);
  }, logger);

  const triggerStart = async (ctx) => safe(ctx, async () => {
    const instanceId = await ensureOwned(ctx, ctx.match[1]);
    await forge.startBot(instanceId);
    await openManageView(ctx, instanceId);
  }, logger);

  const triggerStop = async (ctx) => safe(ctx, async () => {
    const instanceId = await ensureOwned(ctx, ctx.match[1]);
    await forge.stopBot(instanceId);
    await openManageView(ctx, instanceId);
  }, logger);

  const triggerRestart = async (ctx) => safe(ctx, async () => {
    const instanceId = await ensureOwned(ctx, ctx.match[1]);
    await forge.restartBot(instanceId);
    await openManageView(ctx, instanceId);
  }, logger);

  const triggerDelete = async (ctx) => safe(ctx, async () => {
    const instanceId = await ensureOwned(ctx, ctx.match[1]);
    await ctx.reply('Es-tu sûr de vouloir supprimer ce bot ?', Markup.inlineKeyboard([
      [Markup.button.callback('❌ Annuler', `manage:${instanceId}`)],
      [Markup.button.callback('🗑️ Confirmer', `delete-confirm:${instanceId}`)],
    ]));
  }, logger);

  const confirmDelete = async (ctx) => safe(ctx, async () => {
    const instanceId = await ensureOwned(ctx, ctx.match[1]);
    await forge.deleteBot(instanceId);
    await userStore.removeInstanceFromUser(idOf(ctx), instanceId);
    await ctx.reply('Bot supprimé.');
  }, logger);

  const logs = async (ctx) => safe(ctx, async () => {
    const instanceId = await ensureOwned(ctx, ctx.match[1]);
    const config = await forge.getBot(instanceId);
    const status = forge.getBotStatus(instanceId);
    await ctx.reply(`🤖 ${config.botName}\n📊 ${publicStatus(status)}\n🆔 ${instanceId}\n\nLogs de l’instance : disponible dans le système de logs serveur.`, Markup.inlineKeyboard([[Markup.button.callback('⬅️ Retour', `manage:${instanceId}`)]]));
  }, logger);

  bot.start(start);
  bot.command('cancel', cancel);
  bot.command('skip', skipPhoto);
  bot.action('create', beginCreation);
  bot.action('bots', bots);
  bot.action('help', ctx => ctx.reply('Nexus Forge permet de créer et gérer tes bots WhatsApp.', mainKeyboard()));
  bot.action('settings', ctx => ctx.reply(isAdmin(idOf(ctx)) ? 'Paramètres administrateur disponibles prochainement.' : 'Aucun paramètre disponible.'));
  bot.action('cancel', cancel);
  bot.action('confirm', confirm);
  bot.action('edit', ctx => ctx.reply('Utilise /cancel puis relance la création pour modifier les champs.'));
  bot.action(/^manage:(.+)$/, manage);
  bot.action(/^connect:(.+)$/, connectInstance);
  bot.action(/^status:(.+)$/, triggerStatus);
  bot.action(/^start:(.+)$/, triggerStart);
  bot.action(/^stop:(.+)$/, triggerStop);
  bot.action(/^restart:(.+)$/, triggerRestart);
  bot.action(/^delete:(.+)$/, triggerDelete);
  bot.action(/^delete-confirm:(.+)$/, confirmDelete);
  bot.action(/^logs:(.+)$/, logs);
  bot.on('photo', photo);
  bot.on('text', next);
  bot.catch((error, ctx) => logger.error({ error: error.message, telegramUserId: idOf(ctx) }, 'Unhandled Telegram error'));

  return {
    launch: async () => {
      await bot.launch();
      logger.info('Telegram bot started');
    },
    stop: () => bot.stop('SIGINT'),
    bot,
  };
}

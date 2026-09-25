export const NON_IA_COMMANDS = [
  { name: 'menu', aliases: ['m'], description: 'Affiche le menu dynamique de l’instance.', usage: '!menu', category: 'general', execute: async (ctx) => {
    const config = ctx.config || {};
    const commands = ctx.registry?.getAll?.() ?? [];
    const categories = [...new Set(commands.map(command => command.category))];
    const message = [
      `╭━━〔 ${config.botName || 'Nexus Forge'} 〕━━╮`,
      '',
      `👤 Owner : ${config.ownerName || 'N/A'}`,
      `👨‍💻 Dev : ${config.developerName || 'N/A'}`,
      `🔧 Prefix : ${ctx.prefix || '!'}`,
      `📊 Categories : ${categories.length}`,
      `🧩 Commandes : ${commands.length}`,
      '',
      '━━━━━━━━━━━━━━━━',
      ...commands.slice(0, 12).map(command => `${ctx.prefix}${command.name}`),
      '',
      '╰━━━━━━━━━━━━━━━━━━╯',
    ].join('\n');
    await ctx.reply?.(message);
  }},
  { name: 'help', aliases: ['h'], description: 'Affiche l’aide dynamique.', usage: '!help', category: 'general', execute: async (ctx) => {
    const commands = ctx.registry?.getAll?.() ?? [];
    const lines = commands.slice(0, 20).map(command => `${ctx.prefix}${command.name} — ${command.description}`).join('\n');
    await ctx.reply?.(`╭━━〔 COMMANDES 〕━━╮\n\n${lines}\n\n╰━━━━━━━━━━━━━━━━━╯`);
  }},
  { name: 'ping', aliases: ['p'], description: 'Vérifie que le bot répond.', usage: '!ping', category: 'general', execute: async (ctx) => {
    const started = Date.now();
    const latency = Math.max(0, Date.now() - started);
    await ctx.reply?.(`🏓 Pong!\n⚡ ${latency} ms`);
  }},
  { name: 'info', aliases: ['i'], description: 'Affiche les informations du bot.', usage: '!info', category: 'general', execute: async (ctx) => {
    const config = ctx.config || {};
    await ctx.reply?.(`╭━━〔 BOT INFO 〕━━╮\n\n🤖 Nom : ${config.botName || 'Nexus Forge'}\n🆔 ID : ${ctx.instanceId || 'N/A'}\n👨‍💻 Dev : ${config.developerName || 'N/A'}\n🔧 Prefix : ${ctx.prefix || '!'}\n🟢 Status : ${ctx.status || 'ONLINE'}\n\n╰━━━━━━━━━━━━━━╯`);
  }},
  { name: 'uptime', aliases: ['up'], description: 'Affiche le temps de fonctionnement du bot.', usage: '!uptime', category: 'general', execute: async (ctx) => { await ctx.reply?.('⏱️ Uptime indisponible pour cette version.'); }},
  { name: 'whoami', aliases: ['me'], description: 'Affiche le rôle de l’utilisateur.', usage: '!whoami', category: 'general', execute: async (ctx) => {
    const role = ctx.isOwner ? 'owner' : ctx.isAdmin ? 'admin' : 'member';
    await ctx.reply?.(`👤 Rôle : ${role}\n📱 Expéditeur : ${ctx.sender || 'N/A'}`);
  }},
  { name: 'vv', aliases: [], description: 'Afficher le profil ratio rapide.', usage: '!vv', category: 'general', execute: async (ctx) => { await ctx.reply?.('ℹ️ Fonction non encore configurée.'); }},
  { name: 'url', aliases: [], description: 'Génère ou affiche une URL utile.', usage: '!url', category: 'general', execute: async (ctx) => { await ctx.reply?.('🔗 Aucune URL configurée pour cette instance.'); }},
  { name: 'style', aliases: [], description: 'Applique un style textuel rapide.', usage: '!style <texte>', category: 'general', execute: async (ctx) => { await ctx.reply?.('🎨 Style non configuré.'); }},
  { name: 'partager', aliases: ['share'], description: 'Partage un message à l’intérieur du bot.', usage: '!partager', category: 'general', execute: async (ctx) => { await ctx.reply?.('📤 Partage non configuré pour cette version.'); }},

  { name: 'song', aliases: ['music'], description: 'Recherche une chanson.', usage: '!song <titre>', category: 'media', execute: async (ctx) => { await ctx.reply?.('🎵 Service media non configuré.'); }},
  { name: 'image', aliases: ['img'], description: 'Récupère une image.', usage: '!image <requête>', category: 'media', execute: async (ctx) => { await ctx.reply?.('🖼️ Service image non configuré.'); }},
  { name: 'sticker', aliases: [], description: 'Convertit une image ou vidéo en sticker.', usage: '!sticker', category: 'media', execute: async (ctx) => { await ctx.reply?.('📎 Conversion sticker non configurée.'); }},
  { name: 'ytmp4', aliases: [], description: 'Télécharge une vidéo YouTube.', usage: '!ytmp4 <url>', category: 'media', execute: async (ctx) => { await ctx.reply?.('🎬 Service YouTube non configuré.'); }},
  { name: 'lyrics', aliases: [], description: 'Récupère les paroles.', usage: '!lyrics <titre>', category: 'media', execute: async (ctx) => { await ctx.reply?.('🎼 Service lyrics non configuré.'); }},
  { name: 'download', aliases: ['dl'], description: 'Téléchargement générique.', usage: '!download <url>', category: 'media', execute: async (ctx) => { await ctx.reply?.('⬇️ Service de téléchargement non configuré.'); }},

  { name: 'weather', aliases: [], description: 'Affiche la météo.', usage: '!weather <ville>', category: 'utility', execute: async (ctx) => { await ctx.reply?.('🌦️ Service météo non configuré.'); }},
  { name: 'translate', aliases: ['tr'], description: 'Traduit un texte.', usage: '!translate <lang> <texte>', category: 'utility', execute: async (ctx) => { await ctx.reply?.('🌐 Service de traduction non configuré.'); }},
  { name: 'calc', aliases: ['math'], description: 'Calcule une expression mathématique sûre.', usage: '!calc 2+2', category: 'utility', execute: async (ctx) => { await ctx.reply?.('🧮 Service de calcul non configuré.'); }},
  { name: 'quote', aliases: [], description: 'Affiche une citation aléatoire.', usage: '!quote', category: 'utility', execute: async (ctx) => { await ctx.reply?.('💬 Service de citations non configuré.'); }},
  { name: 'joke', aliases: [], description: 'Affiche une blague.', usage: '!joke', category: 'utility', execute: async (ctx) => { await ctx.reply?.('😄 Service de blagues non configuré.'); }},
  { name: 'horoscope', aliases: [], description: 'Affiche l’horoscope.', usage: '!horoscope <signe>', category: 'utility', execute: async (ctx) => { await ctx.reply?.('🔮 Service horoscope non configuré.'); }},
  { name: 'qrcode', aliases: ['qr'], description: 'Génère un QR code à partir d’une chaîne.', usage: '!qrcode <texte>', category: 'utility', execute: async (ctx) => { await ctx.reply?.('📱 Générateur QR non configuré.'); }},
  { name: 'tts', aliases: [], description: 'Convertit du texte en voix.', usage: '!tts <texte>', category: 'utility', execute: async (ctx) => { await ctx.reply?.('🔊 Service TTS non configuré.'); }},
  { name: 'remind', aliases: ['rappel'], description: 'Crée un rappel.', usage: '!remind <durée> <message>', category: 'utility', execute: async (ctx) => { await ctx.reply?.('⏰ Système de rappels non configuré.'); }},
  { name: 'schedule', aliases: ['plan'], description: 'Planifie une tâche.', usage: '!schedule <date> <message>', category: 'utility', execute: async (ctx) => { await ctx.reply?.('📅 Planification non configurée.'); }},
  { name: 'poll', aliases: ['sondage'], description: 'Crée un sondage.', usage: '!poll <question>', category: 'utility', execute: async (ctx) => { await ctx.reply?.('📊 Sondage non configuré pour cette version.'); }},
  { name: 'ascii', aliases: [], description: 'Convertit du texte en ASCII art.', usage: '!ascii <texte>', category: 'utility', execute: async (ctx) => { await ctx.reply?.('🖨️ Service ASCII non configuré.'); }},

  { name: 'coinflip', aliases: [], description: 'Pile ou face.', usage: '!coinflip', category: 'games', execute: async (ctx) => { await ctx.reply?.('🪙 Pile ou face : non configuré.'); }},
  { name: 'dice', aliases: [], description: 'Lance un dé.', usage: '!dice', category: 'games', execute: async (ctx) => { await ctx.reply?.('🎲 Dé non configuré.'); }},
  { name: 'rps', aliases: ['pierre'], description: 'Pierre feuille ciseaux.', usage: '!rps', category: 'games', execute: async (ctx) => { await ctx.reply?.('✊✋✌️ Jeu non configuré.'); }},
  { name: 'tictactoe', aliases: ['ttt'], description: 'Morpion.', usage: '!tictactoe', category: 'games', execute: async (ctx) => { await ctx.reply?.('⭕❌ Jeu de morpion non configuré.'); }},
  { name: 'quiz', aliases: [], description: 'Questionnaire rapide.', usage: '!quiz', category: 'games', execute: async (ctx) => { await ctx.reply?.('🧠 Quiz non configuré.'); }},
  { name: 'dare', aliases: [], description: 'Défi aléatoire.', usage: '!dare', category: 'games', execute: async (ctx) => { await ctx.reply?.('🎯 Défi non configuré.'); }},

  { name: 'ship', aliases: [], description: 'Mélange des profils de façon ludique.', usage: '!ship @user', category: 'fun', execute: async (ctx) => { await ctx.reply?.('💞 Fonction divertissante non configurée.'); }},
  { name: 'gay', aliases: [], description: 'Mini jeu léger et humoristique.', usage: '!gay', category: 'fun', execute: async (ctx) => { await ctx.reply?.('🌈 Mode humoristique non configuré.'); }},
  { name: 'nitro', aliases: [], description: 'Faux nitro / fausse animation.', usage: '!nitro', category: 'fun', execute: async (ctx) => { await ctx.reply?.('🎁 Fausse promo non configurée.'); }},
  { name: 'fakereac', aliases: ['fakereaction'], description: 'Réaction simulée.', usage: '!fakereac', category: 'fun', execute: async (ctx) => { await ctx.reply?.('😂 Réaction simulée non configurée.'); }},

  { name: 'apkinfo', aliases: [], description: 'Analyse un APK fourni.', usage: '!apkinfo', category: 'advanced', execute: async (ctx) => { await ctx.reply?.('📦 Outil APK non disponible dans cette configuration.'); }},

  { name: 'kick', aliases: [], description: 'Expulse un utilisateur d’un groupe.', usage: '!kick @user', category: 'members', groupOnly: true, adminOnly: true, execute: async (ctx) => { await ctx.reply?.('🚫 Cette commande de groupe est prête à être branchée sur les permissions du bot.'); }},
  { name: 'add', aliases: [], description: 'Ajoute un participant au groupe.', usage: '!add 226XXXXXXXX', category: 'members', groupOnly: true, adminOnly: true, execute: async (ctx) => { await ctx.reply?.('👥 Ajout de membre non configuré.'); }},
  { name: 'promote', aliases: [], description: 'Promeut un membre.', usage: '!promote @user', category: 'members', groupOnly: true, adminOnly: true, execute: async (ctx) => { await ctx.reply?.('⬆️ Promotion non configurée.'); }},
  { name: 'demote', aliases: [], description: 'Rétrograde un membre.', usage: '!demote @user', category: 'members', groupOnly: true, adminOnly: true, execute: async (ctx) => { await ctx.reply?.('⬇️ Rétrogradation non configurée.'); }},
  { name: 'mute', aliases: [], description: 'Met en sourdine un membre.', usage: '!mute @user', category: 'members', groupOnly: true, adminOnly: true, execute: async (ctx) => { await ctx.reply?.('🔇 Mute non configuré.'); }},
  { name: 'unmute', aliases: [], description: 'Restaure la parole à un membre.', usage: '!unmute @user', category: 'members', groupOnly: true, adminOnly: true, execute: async (ctx) => { await ctx.reply?.('🔊 Unmute non configuré.'); }},
  { name: 'tgl', aliases: [], description: 'Explique le rôle de l’utilisateur.', usage: '!tgl', category: 'members', groupOnly: true, execute: async (ctx) => { await ctx.reply?.('📌 Fonction de rôle non configurée.'); }},
  { name: 'kickall', aliases: [], description: 'Expulse tous les membres du groupe.', usage: '!kickall', category: 'members', groupOnly: true, ownerOnly: true, execute: async (ctx) => { await ctx.reply?.('🚫 Opération globale non activée.'); }},
  { name: 'kickallv2', aliases: [], description: 'Version avancée d’expulsion globale.', usage: '!kickallv2', category: 'members', groupOnly: true, ownerOnly: true, execute: async (ctx) => { await ctx.reply?.('🚫 Expulsion globale non activée.'); }},
  { name: 'ban', aliases: [], description: 'Bannit un membre du groupe.', usage: '!ban @user', category: 'members', groupOnly: true, adminOnly: true, execute: async (ctx) => { await ctx.reply?.('🚫 Bannissement non configuré.'); }},
  { name: 'unban', aliases: [], description: 'Débannit un membre du groupe.', usage: '!unban @user', category: 'members', groupOnly: true, adminOnly: true, execute: async (ctx) => { await ctx.reply?.('✅ Débannissement non configuré.'); }},

  { name: 'group', aliases: [], description: 'Affiche les infos de groupe.', usage: '!group', category: 'group-config', groupOnly: true, execute: async (ctx) => { await ctx.reply?.('👥 Infos groupe non configurées.'); }},
  { name: 'groupconfig', aliases: [], description: 'Affiche la configuration du groupe.', usage: '!groupconfig', category: 'group-config', groupOnly: true, adminOnly: true, execute: async (ctx) => { await ctx.reply?.('⚙️ Config groupe non configurée.'); }},
  { name: 'setdesc', aliases: [], description: 'Modifie la description du groupe.', usage: '!setdesc <description>', category: 'group-config', groupOnly: true, adminOnly: true, execute: async (ctx) => { await ctx.reply?.('📝 Description de groupe non configurée.'); }},
  { name: 'setppgc', aliases: [], description: 'Modifie la photo du groupe.', usage: '!setppgc', category: 'group-config', groupOnly: true, adminOnly: true, execute: async (ctx) => { await ctx.reply?.('🖼️ Photo de groupe non configurée.'); }},
  { name: 'link', aliases: [], description: 'Génère le lien du groupe.', usage: '!link', category: 'group-config', groupOnly: true, adminOnly: true, execute: async (ctx) => { await ctx.reply?.('🔗 Génération de lien non config.'); }},
  { name: 'tagall', aliases: [], description: 'Mentionne tous les membres.', usage: '!tagall', category: 'group-config', groupOnly: true, adminOnly: true, execute: async (ctx) => { await ctx.reply?.('📣 Tagall non configuré.'); }},
  { name: 'hidetag', aliases: [], description: 'Mentionne sans afficher les numéros.', usage: '!hidetag <message>', category: 'group-config', groupOnly: true, adminOnly: true, execute: async (ctx) => { await ctx.reply?.('🙈 Hidetag non configuré.'); }},
  { name: 'domination', aliases: [], description: 'Commande de domination de groupe.', usage: '!domination', category: 'group-config', groupOnly: true, adminOnly: true, execute: async (ctx) => { await ctx.reply?.('🚩 Domination group non configurée.'); }},
  { name: 'group-tm', aliases: ['grouptm'], description: 'Commande de groupe Tm.', usage: '!group-tm', category: 'group-config', groupOnly: true, adminOnly: true, execute: async (ctx) => { await ctx.reply?.('🧩 Group TM non configuré.'); }},
  { name: 'pseudo', aliases: [], description: 'Gère pseudo de membre.', usage: '!pseudo', category: 'group-config', groupOnly: true, execute: async (ctx) => { await ctx.reply?.('🪪 Gestion des pseudos non configurée.'); }},
  { name: 'pp', aliases: [], description: 'Affiche ou modifie la photo de profil.', usage: '!pp', category: 'group-config', groupOnly: true, execute: async (ctx) => { await ctx.reply?.('🖼️ Photo profile non configurée.'); }},
  { name: 'role', aliases: [], description: 'Affiche le rôle d’un membre.', usage: '!role @user', category: 'group-config', groupOnly: true, execute: async (ctx) => { await ctx.reply?.('🎭 Rôle non configuré.'); }},
  { name: 'modlog', aliases: [], description: 'Affiche le journal de modération.', usage: '!modlog', category: 'group-config', groupOnly: true, adminOnly: true, execute: async (ctx) => { await ctx.reply?.('🧾 Modlog non configuré.'); }},
  { name: 'lock', aliases: [], description: 'Verrouille un paramètre du groupe.', usage: '!lock commands', category: 'group-config', groupOnly: true, adminOnly: true, execute: async (ctx) => { await ctx.reply?.('🔒 Lock group non configuré.'); }},
  { name: 'approve', aliases: [], description: 'Approuve un membre.', usage: '!approve @user', category: 'group-config', groupOnly: true, adminOnly: true, execute: async (ctx) => { await ctx.reply?.('✅ Approbation non configurée.'); }},
  { name: 'whitelist', aliases: ['wl'], description: 'Gère la whitelist du groupe.', usage: '!whitelist add @user', category: 'group-config', groupOnly: true, adminOnly: true, execute: async (ctx) => { await ctx.reply?.('🟩 Whitelist non configurée.'); }},
  { name: 'blacklist', aliases: ['bl'], description: 'Gère la blacklist du groupe.', usage: '!blacklist add @user', category: 'group-config', groupOnly: true, adminOnly: true, execute: async (ctx) => { await ctx.reply?.('🟥 Blacklist non configurée.'); }},

  { name: 'antipurge', aliases: [], description: 'Protection anti-purge.', usage: '!antipurge on', category: 'protection', groupOnly: true, adminOnly: true, execute: async (ctx) => { await ctx.reply?.('🛡️ Protection anti-purge non activée.'); }},
  { name: 'antidemote', aliases: [], description: 'Protection anti-rétrogradation.', usage: '!antidemote on', category: 'protection', groupOnly: true, adminOnly: true, execute: async (ctx) => { await ctx.reply?.('🛡️ Protection anti-démotion non activée.'); }},
  { name: 'antipromote', aliases: [], description: 'Protection anti-promotion.', usage: '!antipromote on', category: 'protection', groupOnly: true, adminOnly: true, execute: async (ctx) => { await ctx.reply?.('🛡️ Protection anti-promotion non activée.'); }},
  { name: 'antitag', aliases: [], description: 'Protection anti-tag', usage: '!antitag on', category: 'protection', groupOnly: true, adminOnly: true, execute: async (ctx) => { await ctx.reply?.('🛡️ Protection anti-tag non activée.'); }},
  { name: 'antilink', aliases: [], description: 'Protection anti-lien.', usage: '!antilink on', category: 'protection', groupOnly: true, adminOnly: true, execute: async (ctx) => { await ctx.reply?.('🛡️ Protection anti-lien non activée.'); }},
  { name: 'antichannel', aliases: [], description: 'Protection anti-channel.', usage: '!antichannel on', category: 'protection', groupOnly: true, adminOnly: true, execute: async (ctx) => { await ctx.reply?.('🛡️ Protection anti-channel non activée.'); }},
  { name: 'antispam', aliases: [], description: 'Protection anti-spam.', usage: '!antispam on', category: 'protection', groupOnly: true, adminOnly: true, execute: async (ctx) => { await ctx.reply?.('🛡️ Protection anti-spam non activée.'); }},
  { name: 'antimention', aliases: [], description: 'Protection anti-mention.', usage: '!antimention on', category: 'protection', groupOnly: true, adminOnly: true, execute: async (ctx) => { await ctx.reply?.('🛡️ Protection anti-mention non activée.'); }},
  { name: 'antisuppression', aliases: [], description: 'Protection anti-suppression.', usage: '!antisuppression on', category: 'protection', groupOnly: true, adminOnly: true, execute: async (ctx) => { await ctx.reply?.('🛡️ Protection anti-suppression non activée.'); }},
  { name: 'antiword', aliases: [], description: 'Protection anti-mot interdit.', usage: '!antiword on', category: 'protection', groupOnly: true, adminOnly: true, execute: async (ctx) => { await ctx.reply?.('🛡️ Protection anti-word non activée.'); }},
  { name: 'antiflood', aliases: [], description: 'Protection anti-flood.', usage: '!antiflood on', category: 'protection', groupOnly: true, adminOnly: true, execute: async (ctx) => { await ctx.reply?.('🛡️ Protection anti-flood non activée.'); }},
  { name: 'antibot', aliases: [], description: 'Protection anti-bot.', usage: '!antibot on', category: 'protection', groupOnly: true, adminOnly: true, execute: async (ctx) => { await ctx.reply?.('🛡️ Protection anti-bot non activée.'); }},

  { name: 'welcome', aliases: [], description: 'Configure le message de bienvenue.', usage: '!welcome on', category: 'welcome', groupOnly: true, adminOnly: true, execute: async (ctx) => { await ctx.reply?.('👋 Accueil groupe non configuré.'); }},
  { name: 'goodbye', aliases: [], description: 'Configure le message d’au revoir.', usage: '!goodbye on', category: 'welcome', groupOnly: true, adminOnly: true, execute: async (ctx) => { await ctx.reply?.('👋 Goodbye groupe non configuré.'); }},
  { name: 'rules', aliases: [], description: 'Affiche les règles du groupe.', usage: '!rules', category: 'welcome', groupOnly: true, execute: async (ctx) => { await ctx.reply?.('📜 Règles non configurées.'); }},
  { name: 'notes', aliases: [], description: 'Gère les notes du groupe.', usage: '!notes add <texte>', category: 'welcome', groupOnly: true, execute: async (ctx) => { await ctx.reply?.('📝 Notes non configurées.'); }},
  { name: 'afk', aliases: [], description: 'Indique un statut AFK.', usage: '!afk', category: 'welcome', execute: async (ctx) => { await ctx.reply?.('🌙 Mode AFK non configuré.'); }},

  { name: 'pairing', aliases: [], description: 'Démarre ou affiche le pairing actif.', usage: '!pairing', category: 'sessions', execute: async (ctx) => { await ctx.reply?.('🔐 Pairing de session non configuré pour cette instance.'); }},
  { name: 'mypair', aliases: [], description: 'Affiche le pairing associé à l’utilisateur.', usage: '!mypair', category: 'sessions', execute: async (ctx) => { await ctx.reply?.('👤 Pairing utilisateur non configuré.'); }},
  { name: 'sessionsudo', aliases: [], description: 'Gère le sudo pour les sessions.', usage: '!sessionsudo', category: 'sessions', ownerOnly: true, execute: async (ctx) => { await ctx.reply?.('🧩 Gestion de session sudo non configurée.'); }},
  { name: 'stoppair', aliases: [], description: 'Stoppe le pairing courant.', usage: '!stoppair', category: 'sessions', execute: async (ctx) => { await ctx.reply?.('🛑 Stop pairing non configuré.'); }},

  { name: 'warn', aliases: [], description: 'Avertit un membre.', usage: '!warn @user', category: 'warnings', groupOnly: true, adminOnly: true, execute: async (ctx) => { await ctx.reply?.('⚠️ Système d’avertissements non configuré.'); }},
  { name: 'unwarn', aliases: [], description: 'Supprime un avertissement.', usage: '!unwarn @user', category: 'warnings', groupOnly: true, adminOnly: true, execute: async (ctx) => { await ctx.reply?.('🟢 Suppression d’avertissement non configurée.'); }},
  { name: 'warnlist', aliases: [], description: 'Affiche la liste des avertissements.', usage: '!warnlist', category: 'warnings', groupOnly: true, adminOnly: true, execute: async (ctx) => { await ctx.reply?.('📋 Liste d’avertissements non configurée.'); }},
  { name: 'clearwarns', aliases: [], description: 'Efface les avertissements.', usage: '!clearwarns', category: 'warnings', groupOnly: true, adminOnly: true, execute: async (ctx) => { await ctx.reply?.('🧹 Clear warns non configuré.'); }},

  { name: 'status', aliases: [], description: 'Affiche le statut du bot.', usage: '!status', category: 'statistics', execute: async (ctx) => { await ctx.reply?.(`📊 Status : ${ctx.status || 'ONLINE'}`); }},
  { name: 'stats', aliases: [], description: 'Affiche les statistiques.', usage: '!stats', category: 'statistics', execute: async (ctx) => { await ctx.reply?.('📈 Statistiques non configurées.'); }},
  { name: 'logs', aliases: [], description: 'Affiche les logs du bot.', usage: '!logs', category: 'statistics', execute: async (ctx) => { await ctx.reply?.('📜 Logs non configurés pour cette version.'); }},
  { name: 'backup', aliases: [], description: 'Sauvegarde la configuration.', usage: '!backup', category: 'statistics', ownerOnly: true, execute: async (ctx) => { await ctx.reply?.('💾 Backup non configuré.'); }},
  { name: 'restore', aliases: [], description: 'Restaure une sauvegarde.', usage: '!restore', category: 'statistics', ownerOnly: true, execute: async (ctx) => { await ctx.reply?.('♻️ Restore non configuré.'); }},
  { name: 'maintenance', aliases: [], description: 'Met le bot en maintenance.', usage: '!maintenance', category: 'statistics', ownerOnly: true, execute: async (ctx) => { await ctx.reply?.('🛠️ Maintenance non configurée.'); }},
  { name: 'shutdown', aliases: [], description: 'Éteint le bot.', usage: '!shutdown', category: 'statistics', ownerOnly: true, execute: async (ctx) => { await ctx.reply?.('🛑 Shutdown non configuré.'); }},
  { name: 'profile', aliases: [], description: 'Affiche le profil du bot.', usage: '!profile', category: 'statistics', execute: async (ctx) => { await ctx.reply?.('👤 Profil non configuré.'); }},
  { name: 'rank', aliases: [], description: 'Affiche le rang d’un membre.', usage: '!rank @user', category: 'statistics', groupOnly: true, execute: async (ctx) => { await ctx.reply?.('🏆 Rank non configuré.'); }},
  { name: 'leaderboard', aliases: ['lb'], description: 'Affiche le classement.', usage: '!leaderboard', category: 'statistics', groupOnly: true, execute: async (ctx) => { await ctx.reply?.('📊 Leaderboard non configuré.'); }},
  { name: 'daily', aliases: [], description: 'Récompense quotidienne.', usage: '!daily', category: 'statistics', execute: async (ctx) => { await ctx.reply?.('🎁 Daily non configuré.'); }},
  { name: 'cmdinfo', aliases: ['commandinfo'], description: 'Informations d’une commande.', usage: '!cmdinfo <commande>', category: 'statistics', execute: async (ctx) => { await ctx.reply?.('📘 Command info non configuré.'); }},

  { name: 'public', aliases: [], description: 'Active le mode public.', usage: '!public', category: 'modes', adminOnly: true, execute: async (ctx) => { await ctx.reply?.('🌍 Mode public non configuré.'); }},
  { name: 'private', aliases: [], description: 'Active le mode privé.', usage: '!private', category: 'modes', adminOnly: true, execute: async (ctx) => { await ctx.reply?.('🔒 Mode privé non configuré.'); }},
  { name: 'prefix', aliases: [], description: 'Affiche ou modifie le préfixe.', usage: '!prefix !', category: 'modes', adminOnly: true, execute: async (ctx) => { await ctx.reply?.('🔧 Prefix non configuré.'); }},

  { name: 'sudo', aliases: [], description: 'Affiche les infos sudo.', usage: '!sudo', category: 'owner', ownerOnly: true, execute: async (ctx) => { await ctx.reply?.('👑 Sudo non configuré.'); }},
  { name: 'setsudo', aliases: [], description: 'Définit un sudo.', usage: '!setsudo', category: 'owner', ownerOnly: true, execute: async (ctx) => { await ctx.reply?.('🛡️ Sudo non configuré.'); }},
  { name: 'addsudo', aliases: [], description: 'Ajoute un sudo.', usage: '!addsudo @user', category: 'owner', ownerOnly: true, execute: async (ctx) => { await ctx.reply?.('➕ Addsudo non configuré.'); }},
  { name: 'delsudo', aliases: [], description: 'Supprime un sudo.', usage: '!delsudo @user', category: 'owner', ownerOnly: true, execute: async (ctx) => { await ctx.reply?.('➖ Delsudo non configuré.'); }},
  { name: 'removesudo', aliases: [], description: 'Retire un sudo.', usage: '!removesudo @user', category: 'owner', ownerOnly: true, execute: async (ctx) => { await ctx.reply?.('➖ Removesudo non configuré.'); }},
  { name: 'listsudo', aliases: [], description: 'Liste les sudo.', usage: '!listsudo', category: 'owner', ownerOnly: true, execute: async (ctx) => { await ctx.reply?.('📋 Listsudo non configuré.'); }},
  { name: 'broadcast', aliases: [], description: 'Diffuse un message.', usage: '!broadcast <texte>', category: 'owner', ownerOnly: true, execute: async (ctx) => { await ctx.reply?.('📣 Broadcast non configuré.'); }},
  { name: 'reload', aliases: [], description: 'Recharge la configuration.', usage: '!reload', category: 'owner', ownerOnly: true, execute: async (ctx) => { await ctx.reply?.('🔄 Reload non configuré.'); }},
  { name: 'restart', aliases: ['reboot'], description: 'Redémarre le bot.', usage: '!restart', category: 'owner', ownerOnly: true, execute: async (ctx) => { await ctx.reply?.('🔁 Restart non configuré.'); }},
  { name: 'stop', aliases: [], description: 'Stoppe le bot.', usage: '!stop', category: 'owner', ownerOnly: true, execute: async (ctx) => { await ctx.reply?.('⏹️ Stop non configuré.'); }},
  { name: 'eval', aliases: [], description: 'Évalue du code JavaScript.', usage: '!eval <code>', category: 'owner', ownerOnly: true, execute: async (ctx) => { await ctx.reply?.('⚠️ Éval non activée par défaut.'); }},
  { name: 'exec', aliases: [], description: 'Exécute une commande shell.', usage: '!exec <cmd>', category: 'owner', ownerOnly: true, execute: async (ctx) => { await ctx.reply?.('⚠️ Exec non activée par défaut.'); }},
  { name: 'dit', aliases: [], description: 'Commande propriétaire de diagnostic.', usage: '!dit', category: 'owner', ownerOnly: true, execute: async (ctx) => { await ctx.reply?.('🧪 Dit non configuré.'); }},
  { name: 'pack', aliases: [], description: 'Affiche les packs disponibles.', usage: '!pack', category: 'owner', ownerOnly: true, execute: async (ctx) => { await ctx.reply?.('📦 Pack non configuré.'); }},
  { name: 'addpremium', aliases: [], description: 'Ajoute un statut premium.', usage: '!addpremium @user', category: 'owner', ownerOnly: true, execute: async (ctx) => { await ctx.reply?.('💎 Premium non configuré.'); }},
  { name: 'removepremium', aliases: [], description: 'Supprime un statut premium.', usage: '!removepremium @user', category: 'owner', ownerOnly: true, execute: async (ctx) => { await ctx.reply?.('💎 Premium removal non configuré.'); }},

  { name: 'tgs', aliases: [], description: 'Gestion des stickers TGS.', usage: '!tgs', category: 'other', execute: async (ctx) => { await ctx.reply?.('🎞️ Service TGS non configuré.'); }},
];

export function getNonIaCommands() {
  return [...NON_IA_COMMANDS];
}

const MAX_TEXT = 4_000;

function text(ctx) {
  return String(ctx.rawArgs ?? ctx.args?.join(' ') ?? '').trim();
}

function prefix(ctx) {
  return ctx.prefix ?? ctx.config?.prefix ?? '!';
}

async function reply(ctx, message) {
  if (typeof ctx.reply !== 'function') throw new Error('Le contexte WhatsApp ne fournit pas reply()');
  return ctx.reply(message);
}

function requireText(ctx, usage) {
  const value = text(ctx);
  if (!value) throw new Error(`Usage : ${prefix(ctx)}${usage}`);
  return value;
}

function truncate(value, limit = MAX_TEXT) {
  const input = String(value ?? '');
  return input.length <= limit ? input : `${input.slice(0, limit - 1)}…`;
}

function formatDuration(ms) {
  let seconds = Math.max(0, Math.floor(ms / 1_000));
  const days = Math.floor(seconds / 86_400); seconds %= 86_400;
  const hours = Math.floor(seconds / 3_600); seconds %= 3_600;
  const minutes = Math.floor(seconds / 60); seconds %= 60;
  return [days && `${days}j`, hours && `${hours}h`, minutes && `${minutes}m`, `${seconds}s`].filter(Boolean).join(' ');
}

function commandList(ctx) {
  return [...(ctx.registry?.getAll?.() ?? [])]
    .filter(command => !command.hidden)
    .sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
}

function groupedHelp(ctx) {
  const groups = new Map();
  for (const command of commandList(ctx)) {
    if (!groups.has(command.category)) groups.set(command.category, []);
    groups.get(command.category).push(command);
  }
  return [...groups].map(([category, commands]) => `*${category}*\n${commands.map(command => `• ${prefix(ctx)}${command.name} — ${command.description}`).join('\n')}`).join('\n\n');
}

function parseSafeExpression(expression) {
  const source = expression.replace(/\s+/g, '');
  if (!source || source.length > 120 || !/^[0-9()+\-*/%.]+$/.test(source)) throw new Error('Expression invalide. Seuls les nombres et + - * / % ( ) sont acceptés.');
  let index = 0;
  const peek = () => source[index];
  const consume = (char) => { if (peek() === char) { index += 1; return true; } return false; };
  const number = () => {
    const start = index;
    while (/\d|\./.test(peek() ?? '')) index += 1;
    const value = Number(source.slice(start, index));
    if (!Number.isFinite(value)) throw new Error('Nombre invalide.');
    return value;
  };
  const factor = () => {
    if (consume('+')) return factor();
    if (consume('-')) return -factor();
    if (consume('(')) { const value = additive(); if (!consume(')')) throw new Error('Parenthèse fermante manquante.'); return value; }
    return number();
  };
  const multiplicative = () => { let value = factor(); while ('*/%'.includes(peek() ?? '')) { const op = source[index++]; const right = factor(); if ((op === '/' || op === '%') && right === 0) throw new Error('Division par zéro.'); value = op === '*' ? value * right : op === '/' ? value / right : value % right; } return value; };
  const additive = () => { let value = multiplicative(); while (peek() === '+' || peek() === '-') { const op = source[index++]; const right = multiplicative(); value = op === '+' ? value + right : value - right; } return value; };
  const result = additive();
  if (index !== source.length || !Number.isFinite(result)) throw new Error('Expression invalide ou résultat trop grand.');
  return result;
}

function service(ctx, name) {
  const handler = ctx.services?.[name] ?? ctx[name];
  if (typeof handler !== 'function') throw new Error(`Le service ${name} n’est pas configuré sur cette instance.`);
  return handler;
}

export const FIRST_BATCH_COMMANDS = [
  { name: 'menu', aliases: ['m'], description: 'Affiche le menu complet et catégorisé.', usage: '!menu', category: 'core', execute: async ctx => reply(ctx, `╭━━〔 ${ctx.config?.botName ?? 'Nexus Forge'} 〕━━╮\n\n👤 Owner : ${ctx.config?.ownerName ?? 'N/A'}\n👨‍💻 Dev : ${ctx.config?.developerName ?? 'N/A'}\n🔧 Préfixe : ${prefix(ctx)}\n🧩 Commandes : ${commandList(ctx).length}\n\n${groupedHelp(ctx)}\n\n╰━━━━━━━━━━━━━━━━━━╯`) },
  { name: 'help', aliases: ['h'], description: 'Affiche l’aide complète, triée par catégorie.', usage: '!help [commande|catégorie]', category: 'core', execute: async ctx => { const query = text(ctx).toLowerCase(); if (!query) return reply(ctx, `╭━━〔 AIDE 〕━━╮\n\n${groupedHelp(ctx)}\n\nUtilise ${prefix(ctx)}help <commande> pour le détail.`); const command = ctx.registry?.get?.(query); if (command) return reply(ctx, `*${prefix(ctx)}${command.name}*\n${command.description}\nUsage : ${command.usage ?? `${prefix(ctx)}${command.name}`}\nCatégorie : ${command.category}`); const matches = commandList(ctx).filter(item => item.category.toLowerCase() === query); if (matches.length) return reply(ctx, matches.map(item => `• ${prefix(ctx)}${item.name} — ${item.description}`).join('\n')); throw new Error(`Commande ou catégorie inconnue : ${query}`); } },
  { name: 'ping', aliases: ['p'], description: 'Mesure la latence de réception et répond.', usage: '!ping', category: 'core', execute: async ctx => { const latency = Number.isFinite(ctx.receivedAt) ? Math.max(0, Date.now() - ctx.receivedAt) : null; return reply(ctx, `🏓 Pong !${latency === null ? '' : `\n⚡ Latence : ${latency} ms`}`); } },
  { name: 'info', aliases: ['i'], description: 'Affiche les informations détaillées de l’instance.', usage: '!info', category: 'core', execute: async ctx => reply(ctx, `╭━━〔 BOT INFO 〕━━╮\n\n🤖 Nom : ${ctx.config?.botName ?? 'Nexus Forge'}\n🆔 Instance : ${ctx.instanceId ?? 'N/A'}\n👨‍💻 Développeur : ${ctx.config?.developerName ?? 'N/A'}\n🔧 Préfixe : ${prefix(ctx)}\n🌐 Mode : ${ctx.config?.mode ?? 'public'}\n🕒 Fuseau : ${ctx.config?.timezone ?? 'UTC'}\n📡 Statut : ${ctx.status ?? 'inconnu'}\n\n╰━━━━━━━━━━━━━━━━━━╯`) },
  { name: 'uptime', aliases: ['up'], description: 'Affiche la durée de fonctionnement du processus.', usage: '!uptime', category: 'general', execute: async ctx => reply(ctx, `⏱️ Uptime : ${formatDuration(process.uptime() * 1_000)}`) },
  { name: 'whoami', aliases: ['me'], description: 'Affiche votre identité et votre rôle.', usage: '!whoami', category: 'general', execute: async ctx => reply(ctx, `👤 Expéditeur : ${ctx.sender ?? 'inconnu'}\n🛡️ Rôle : ${ctx.isOwner ? 'owner' : ctx.isAdmin ? 'admin' : 'member'}\n💬 Chat : ${ctx.chatId ?? ctx.chat ?? 'inconnu'}`) },
  { name: 'vv', description: 'Affiche un résumé rapide du profil du bot.', usage: '!vv', category: 'general', execute: async ctx => reply(ctx, `🤖 ${ctx.config?.botName ?? 'Nexus Forge'}\n📌 ${ctx.config?.ownerName ?? 'Owner inconnu'}\n✅ Instance ${ctx.instanceId ?? 'N/A'}`) },
  { name: 'url', description: 'Valide une URL et affiche sa forme normalisée.', usage: '!url <https://…>', category: 'general', execute: async ctx => { const value = requireText(ctx, 'url <https://…>'); let parsed; try { parsed = new URL(value); } catch { throw new Error('URL invalide. Exemple : https://example.com'); } if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('Seules les URL http(s) sont autorisées.'); return reply(ctx, `🔗 URL valide :\n${parsed.href}`); } },
  { name: 'style', description: 'Applique un style Unicode simple à un texte.', usage: '!style <texte>', category: 'general', execute: async ctx => { const value = truncate(requireText(ctx, 'style <texte>'), 500); const bold = value.replace(/[A-Za-z]/g, char => String.fromCodePoint(char.toLowerCase().charCodeAt(0) + 0x1d400 - 97)); return reply(ctx, `🎨 ${bold}`); } },
  { name: 'partager', aliases: ['share'], description: 'Rejoue un texte dans le chat courant.', usage: '!partager <message>', category: 'general', execute: async ctx => reply(ctx, `📤 ${truncate(requireText(ctx, 'partager <message>'))}`) },
  { name: 'song', aliases: ['music'], description: 'Recherche une chanson via le service média configuré.', usage: '!song <titre>', category: 'media', execute: async ctx => reply(ctx, truncate(await service(ctx, 'searchSong')(requireText(ctx, 'song <titre>')))) },
  { name: 'image', aliases: ['img'], description: 'Recherche une image via le service média configuré.', usage: '!image <requête>', category: 'media', execute: async ctx => reply(ctx, truncate(await service(ctx, 'searchImage')(requireText(ctx, 'image <requête>')))) },
  { name: 'sticker', description: 'Convertit le média cité ou joint en sticker.', usage: '!sticker', category: 'media', execute: async ctx => { const convert = service(ctx, 'createSticker'); return convert(ctx); } },
  { name: 'ytmp4', description: 'Prépare le téléchargement d’une vidéo via le service média.', usage: '!ytmp4 <url>', category: 'media', execute: async ctx => { const value = requireText(ctx, 'ytmp4 <url>'); let url; try { url = new URL(value); } catch { throw new Error('URL vidéo invalide.'); } if (!['http:', 'https:'].includes(url.protocol)) throw new Error('URL vidéo non autorisée.'); return reply(ctx, truncate(await service(ctx, 'downloadVideo')(url.href))); } },
  { name: 'lyrics', description: 'Recherche les paroles via le service média configuré.', usage: '!lyrics <titre>', category: 'media', execute: async ctx => reply(ctx, truncate(await service(ctx, 'searchLyrics')(requireText(ctx, 'lyrics <titre>')))) },
  { name: 'download', aliases: ['dl'], description: 'Télécharge une ressource HTTP via le service configuré.', usage: '!download <url>', category: 'media', execute: async ctx => { const value = requireText(ctx, 'download <url>'); let url; try { url = new URL(value); } catch { throw new Error('URL invalide.'); } if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Seules les URL http(s) sont autorisées.'); return service(ctx, 'download')(url.href, ctx); } },
  { name: 'weather', description: 'Affiche la météo via le service configuré.', usage: '!weather <ville>', category: 'utility', execute: async ctx => reply(ctx, truncate(await service(ctx, 'weather')(requireText(ctx, 'weather <ville>')))) },
  { name: 'translate', aliases: ['tr'], description: 'Traduit un texte via le service configuré.', usage: '!translate <langue> <texte>', category: 'utility', execute: async ctx => { const args = ctx.args ?? []; if (args.length < 2) throw new Error(`Usage : ${prefix(ctx)}translate <langue> <texte>`); return reply(ctx, truncate(await service(ctx, 'translate')(args[0], args.slice(1).join(' ')))); } },
  { name: 'calc', aliases: ['math'], description: 'Calcule une expression sans eval ni exécution de code.', usage: '!calc 2*(3+4)', category: 'utility', execute: async ctx => reply(ctx, `🧮 ${parseSafeExpression(requireText(ctx, 'calc <expression>'))}`) },
  { name: 'quote', description: 'Affiche une citation aléatoire hors ligne.', usage: '!quote', category: 'utility', execute: async ctx => { const quotes = ['La simplicité est la sophistication suprême. — Léonard de Vinci', 'Le succès est la somme de petits efforts répétés. — Robert Collier', 'La qualité naît de l’attention.']; return reply(ctx, `💬 ${quotes[Math.floor(Math.random() * quotes.length)]}`); } },
];

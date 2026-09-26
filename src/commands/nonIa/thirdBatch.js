function text(ctx) {
  return String(ctx.rawArgs ?? ctx.args?.join(' ') ?? '').trim();
}

function prefix(ctx) {
  return ctx.prefix ?? ctx.config?.prefix ?? '!';
}

async function reply(ctx, message, options) {
  if (typeof ctx.reply !== 'function') throw new Error('Le contexte WhatsApp ne fournit pas reply()');
  return ctx.reply(message, options);
}

function requireGroup(ctx, usage) {
  if (!ctx.isGroup) throw new Error('Cette commande est disponible uniquement dans un groupe.');
  if (usage && !text(ctx)) throw new Error(`Usage : ${prefix(ctx)}${usage}`);
}

function groupService(ctx, name) {
  const handler = ctx.groupActions?.[name] ?? ctx.services?.[name] ?? ctx[name];
  if (typeof handler !== 'function') throw new Error(`L'action de groupe « ${name} » n'est pas configurée.`);
  return handler;
}

function target(ctx, usage) {
  const value = text(ctx).split(/\s+/).filter(Boolean)[0];
  if (!value) throw new Error(`Usage : ${prefix(ctx)}${usage}`);
  const normalized = value.replace(/^@/, '').replace(/[^0-9:._-]/g, '');
  if (!normalized) throw new Error('Participant invalide. Mentionnez un membre ou indiquez son identifiant.');
  return normalized;
}

function participants(ctx) {
  return ctx.groupMetadata?.participants ?? ctx.metadata?.participants ?? [];
}

function participantId(participant) {
  return participant?.id ?? participant?.jid ?? participant?.phoneNumber;
}

function formatResult(result, fallback) {
  if (typeof result === 'string') return result;
  if (result?.message) return result.message;
  return fallback;
}

async function perform(ctx, action, args, fallback) {
  const result = await groupService(ctx, action)(ctx, ...args);
  return reply(ctx, formatResult(result, fallback));
}

export const THIRD_BATCH_COMMANDS = [
  { name: 'kick', description: 'Retire un participant du groupe.', usage: '!kick @participant', category: 'members', groupOnly: true, adminOnly: true, execute: async ctx => { requireGroup(ctx, 'kick @participant'); return perform(ctx, 'removeParticipant', [target(ctx, 'kick @participant')], '✅ Participant retiré du groupe.'); } },
  { name: 'add', description: 'Ajoute un numéro au groupe.', usage: '!add <numéro>', category: 'members', groupOnly: true, adminOnly: true, execute: async ctx => { requireGroup(ctx, 'add <numéro>'); const phone = target(ctx, 'add <numéro>'); if (!/^\d{7,15}$/.test(phone)) throw new Error('Numéro invalide. Utilisez uniquement 7 à 15 chiffres avec indicatif.'); return perform(ctx, 'addParticipant', [phone], '✅ Participant ajouté au groupe.'); } },
  { name: 'promote', description: 'Nomme un participant administrateur.', usage: '!promote @participant', category: 'members', groupOnly: true, adminOnly: true, execute: async ctx => { requireGroup(ctx, 'promote @participant'); return perform(ctx, 'promoteParticipant', [target(ctx, 'promote @participant')], '✅ Participant promu administrateur.'); } },
  { name: 'demote', description: 'Retire les droits administrateur.', usage: '!demote @participant', category: 'members', groupOnly: true, adminOnly: true, execute: async ctx => { requireGroup(ctx, 'demote @participant'); return perform(ctx, 'demoteParticipant', [target(ctx, 'demote @participant')], '✅ Droits administrateur retirés.'); } },
  { name: 'mute', description: 'Applique une restriction à un participant via le service de modération.', usage: '!mute @participant [durée]', category: 'members', groupOnly: true, adminOnly: true, execute: async ctx => { requireGroup(ctx, 'mute @participant [durée]'); const args = text(ctx).split(/\s+/); return perform(ctx, 'muteParticipant', [args[0].replace(/^@/, ''), args[1] ?? null], '✅ Participant restreint.'); } },
  { name: 'unmute', description: 'Retire la restriction d’un participant.', usage: '!unmute @participant', category: 'members', groupOnly: true, adminOnly: true, execute: async ctx => { requireGroup(ctx, 'unmute @participant'); return perform(ctx, 'unmuteParticipant', [target(ctx, 'unmute @participant')], '✅ Restriction retirée.'); } },
  { name: 'tgl', description: 'Affiche le rôle d’un participant dans le groupe.', usage: '!tgl [@participant]', category: 'members', groupOnly: true, execute: async ctx => { requireGroup(ctx); const id = text(ctx) ? target(ctx, 'tgl [@participant]') : String(ctx.sender ?? ''); const member = participants(ctx).find(item => String(participantId(item)).includes(id)); const role = member?.admin === 'superadmin' ? 'propriétaire' : member?.admin === 'admin' ? 'administrateur' : 'membre'; return reply(ctx, `📌 Participant : ${id || 'inconnu'}\n🎭 Rôle : ${role}`); } },
  { name: 'kickall', description: 'Retire tous les membres non privilégiés du groupe.', usage: '!kickall', category: 'members', groupOnly: true, ownerOnly: true, execute: async ctx => { requireGroup(ctx); const ids = participants(ctx).filter(item => !item.admin && String(participantId(item)) !== String(ctx.botId ?? ctx.botJid)).map(participantId).filter(Boolean); if (!ids.length) throw new Error('Aucun membre éligible à retirer.'); return perform(ctx, 'removeParticipants', [ids], `✅ ${ids.length} membre(s) retiré(s).`); } },
  { name: 'kickallv2', description: 'Retire les membres non privilégiés par lots contrôlés.', usage: '!kickallv2', category: 'members', groupOnly: true, ownerOnly: true, execute: async ctx => { requireGroup(ctx); const ids = participants(ctx).filter(item => !item.admin && String(participantId(item)) !== String(ctx.botId ?? ctx.botJid)).map(participantId).filter(Boolean); if (!ids.length) throw new Error('Aucun membre éligible à retirer.'); return perform(ctx, 'removeParticipantsBatched', [ids], `✅ Opération terminée : ${ids.length} membre(s) traité(s).`); } },
  { name: 'ban', description: 'Retire un participant et l’ajoute à la liste noire persistante.', usage: '!ban @participant [raison]', category: 'members', groupOnly: true, adminOnly: true, execute: async ctx => { requireGroup(ctx, 'ban @participant [raison]'); const args = text(ctx).split(/\s+/); const id = args.shift().replace(/^@/, ''); return perform(ctx, 'banParticipant', [id, args.join(' ') || null], '✅ Participant banni et retiré.'); } },
  { name: 'unban', description: 'Retire un participant de la liste noire.', usage: '!unban @participant', category: 'members', groupOnly: true, adminOnly: true, execute: async ctx => { requireGroup(ctx, 'unban @participant'); return perform(ctx, 'unbanParticipant', [target(ctx, 'unban @participant')], '✅ Participant débanni.'); } },
  { name: 'group', description: 'Affiche les informations actuelles du groupe.', usage: '!group', category: 'group-config', groupOnly: true, execute: async ctx => { requireGroup(ctx); const metadata = ctx.groupMetadata ?? await groupService(ctx, 'getMetadata')(ctx); const members = metadata.participants ?? []; return reply(ctx, `👥 ${metadata.subject ?? ctx.groupName ?? 'Groupe'}\n🆔 ${metadata.id ?? ctx.chatId ?? 'inconnu'}\n👤 Membres : ${members.length}\n🛡️ Administrateurs : ${members.filter(item => item.admin).length}\n📝 Description : ${metadata.desc ?? 'Aucune'}`); } },
  { name: 'groupconfig', description: 'Affiche les options de configuration disponibles.', usage: '!groupconfig', category: 'group-config', groupOnly: true, adminOnly: true, execute: async ctx => { requireGroup(ctx); const metadata = ctx.groupMetadata ?? await groupService(ctx, 'getMetadata')(ctx); return reply(ctx, `⚙️ Configuration\n🔒 Verrouillage : ${metadata.restrict ? 'activé' : 'désactivé'}\n📢 Annonces : ${metadata.announce ? 'activées' : 'désactivées'}\n📝 Description : ${metadata.desc ? 'définie' : 'absente'}`); } },
  { name: 'setdesc', description: 'Remplace la description du groupe.', usage: '!setdesc <description>', category: 'group-config', groupOnly: true, adminOnly: true, execute: async ctx => { requireGroup(ctx, 'setdesc <description>'); const value = text(ctx); if (value.length > 512) throw new Error('La description ne doit pas dépasser 512 caractères.'); return perform(ctx, 'updateDescription', [value], '✅ Description mise à jour.'); } },
  { name: 'setppgc', description: 'Modifie la photo du groupe à partir du média fourni.', usage: '!setppgc', category: 'group-config', groupOnly: true, adminOnly: true, execute: async ctx => { requireGroup(ctx); return perform(ctx, 'updateGroupPhoto', [ctx], '✅ Photo du groupe mise à jour.'); } },
  { name: 'link', description: 'Génère le lien d’invitation actuel du groupe.', usage: '!link', category: 'group-config', groupOnly: true, adminOnly: true, execute: async ctx => { requireGroup(ctx); const result = await groupService(ctx, 'getInviteCode')(ctx); if (!result) throw new Error('Impossible de générer le lien actuellement.'); return reply(ctx, `🔗 Lien du groupe : https://chat.whatsapp.com/${String(result).replace(/^https?:\/\/.*\//, '')}`); } },
  { name: 'tagall', description: 'Mentionne tous les membres du groupe.', usage: '!tagall [message]', category: 'group-config', groupOnly: true, adminOnly: true, execute: async ctx => { requireGroup(ctx); const ids = participants(ctx).map(participantId).filter(Boolean); if (!ids.length) throw new Error('La liste des membres est indisponible.'); const message = text(ctx) || 'Tous les membres sont mentionnés.'; return perform(ctx, 'mentionParticipants', [ids, message], message); } },
  { name: 'hidetag', description: 'Mentionne tous les membres sans afficher leurs identifiants.', usage: '!hidetag <message>', category: 'group-config', groupOnly: true, adminOnly: true, execute: async ctx => { requireGroup(ctx, 'hidetag <message>'); const ids = participants(ctx).map(participantId).filter(Boolean); if (!ids.length) throw new Error('La liste des membres est indisponible.'); return perform(ctx, 'mentionParticipants', [ids, text(ctx)], text(ctx)); } },
  { name: 'domination', description: 'Affiche un récapitulatif de modération du groupe.', usage: '!domination', category: 'group-config', groupOnly: true, adminOnly: true, execute: async ctx => { requireGroup(ctx); const admins = participants(ctx).filter(item => item.admin).length; const total = participants(ctx).length; return reply(ctx, `👑 Contrôle du groupe\n👥 Membres : ${total}\n🛡️ Administrateurs : ${admins}\n📊 Ratio admin : ${total ? Math.round((admins / total) * 100) : 0}%`); } },
  { name: 'group-tm', aliases: ['grouptm'], description: 'Modifie le mode de rédaction réservé aux administrateurs.', usage: '!group-tm <on|off>', category: 'group-config', groupOnly: true, adminOnly: true, execute: async ctx => { requireGroup(ctx, 'group-tm <on|off>'); const value = text(ctx).toLowerCase(); if (!['on', 'off'].includes(value)) throw new Error(`Usage : ${prefix(ctx)}group-tm <on|off>`); return perform(ctx, 'setAnnouncementMode', [value === 'on'], `✅ Mode annonces ${value === 'on' ? 'activé' : 'désactivé'}.`); } }
];

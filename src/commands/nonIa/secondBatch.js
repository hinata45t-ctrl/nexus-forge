const EMOJIS = ['😀', '😁', '😂', '😃', '😄', '😅', '😆', '😇', '😈', '😉', '😊', '😋', '😌', '😍', '😎', '😏', '😐', '😑', '😒', '😓'];
const ZODIAC_SIGNS = ['Bélier', 'Taureau', 'Gémeaux', 'Cancer', 'Lion', 'Vierge', 'Balance', 'Scorpion', 'Sagittaire', 'Capricorne', 'Verseau', 'Poissons'];
const HOROSCOPES = {
  'Bélier': 'Audace et détermination vous guident aujourd\'hui. Les défis deviennent des opportunités.',
  'Taureau': 'Stabilité et persévérance sont vos alliés. Attendez-vous à du progrès matériel.',
  'Gémeaux': 'Créativité et communication brillent. Un message important vous attend.',
  'Cancer': 'Intuition et émotions vous guident. Écoutez votre cœur.',
  'Lion': 'Confiance et leadership naturel. C\'est votre moment de briller.',
  'Vierge': 'Analyse et précision vous servent bien. Les détails importent.',
  'Balance': 'Harmonie et équilibre règnent. Les relations s\'approfondissent.',
  'Scorpion': 'Passion et transformation. Le changement est bénéfique.',
  'Sagittaire': 'Expansion et aventure vous appellent. Explorez de nouveaux horizons.',
  'Capricorne': 'Ambition et discipline payent. Les objectifs se concrétisent.',
  'Verseau': 'Innovation et originalité. Vos idées sont avant-gardistes.',
  'Poissons': 'Rêves et imaginaire. Votre créativité n\'a pas de limites.'
};

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

function truncate(value, limit = 4_000) {
  const input = String(value ?? '');
  return input.length <= limit ? input : `${input.slice(0, limit - 1)}…`;
}

function service(ctx, name) {
  const handler = ctx.services?.[name] ?? ctx[name];
  if (typeof handler !== 'function') throw new Error(`Le service ${name} n'est pas configuré sur cette instance.`);
  return handler;
}

export const SECOND_BATCH_COMMANDS = [
  { name: 'joke', description: 'Affiche une blague courte de la base locale.', usage: '!joke', category: 'utility', execute: async ctx => {
    const jokes = [
      'Pourquoi les plongeurs plongent-ils toujours en arrière et jamais en avant ? Parce que sinon ils tombent dans le bateau !',
      'Qu\'est-ce qu\'un crocodile qui surveille la pharmacie ? Un Lacoste-gaurd !',
      'Quel est le comble pour un électricien ? De ne pas être au courant !',
      'Comment appelle-t-on un chat tombé dans un pot de peinture le jour de Noël ? Un chat-peint de Noël !',
      'Qu\'est-ce qu\'un canif ? Un petit fien.'
    ];
    return reply(ctx, `😄 ${jokes[Math.floor(Math.random() * jokes.length)]}`);
  } },
  { name: 'horoscope', description: 'Affiche l\'horoscope pour un signe astrologique.', usage: '!horoscope <signe>', category: 'utility', execute: async ctx => {
    const sign = requireText(ctx, 'horoscope <signe>').toLowerCase();
    const found = Object.keys(HOROSCOPES).find(s => s.toLowerCase() === sign);
    if (!found) throw new Error(`Signe inconnu. Options : ${ZODIAC_SIGNS.join(', ')}`);
    return reply(ctx, `🔮 ${found}\n${HOROSCOPES[found]}`);
  } },
  { name: 'qrcode', aliases: ['qr'], description: 'Génère un code QR pour un texte ou une URL via le service configuré.', usage: '!qrcode <texte>', category: 'utility', execute: async ctx => {
    const value = truncate(requireText(ctx, 'qrcode <texte>'), 500);
    return reply(ctx, truncate(await service(ctx, 'generateQR')(value)));
  } },
  { name: 'tts', description: 'Convertit un texte en fichier audio via le service configuré.', usage: '!tts <texte>', category: 'utility', execute: async ctx => {
    const value = truncate(requireText(ctx, 'tts <texte>'), 500);
    return service(ctx, 'textToSpeech')(value, ctx);
  } },
  { name: 'remind', aliases: ['rappel'], description: 'Configure un rappel pour plus tard via le service configuré.', usage: '!remind <durée> <message>', category: 'utility', execute: async ctx => {
    const args = ctx.args ?? [];
    if (args.length < 2) throw new Error(`Usage : ${prefix(ctx)}remind <durée> <message>`);
    return reply(ctx, truncate(await service(ctx, 'setReminder')(args[0], args.slice(1).join(' '), ctx)));
  } },
  { name: 'schedule', aliases: ['plan'], description: 'Planifie une tâche pour une date donnée via le service configuré.', usage: '!schedule <date> <message>', category: 'utility', execute: async ctx => {
    const args = ctx.args ?? [];
    if (args.length < 2) throw new Error(`Usage : ${prefix(ctx)}schedule <date> <message>`);
    return reply(ctx, truncate(await service(ctx, 'scheduleTask')(args[0], args.slice(1).join(' '), ctx)));
  } },
  { name: 'poll', aliases: ['sondage'], description: 'Crée un sondage simple (réactions WhatsApp).', usage: '!poll <question> [option1] [option2] ...', category: 'utility', execute: async ctx => {
    const args = ctx.args ?? [];
    if (args.length < 2) throw new Error(`Usage : ${prefix(ctx)}poll <question> option1 option2 ...`);
    const question = args[0];
    const options = args.slice(1);
    const pollText = [`📊 Sondage : ${question}`, ...options.map((opt, i) => `${i + 1}. ${opt}`), '\nRéagissez avec un emoji numéroté pour voter.'].join('\n');
    return reply(ctx, truncate(pollText));
  } },
  { name: 'ascii', description: 'Convertit du texte en ASCII art basique via le service configuré.', usage: '!ascii <texte>', category: 'utility', execute: async ctx => {
    const value = truncate(requireText(ctx, 'ascii <texte>'), 100);
    return reply(ctx, truncate(await service(ctx, 'generateASCII')(value)));
  } },
  { name: 'coinflip', description: 'Lance une pièce virtuelle (pile ou face).', usage: '!coinflip', category: 'games', execute: async ctx => reply(ctx, `🪙 ${Math.random() < 0.5 ? 'Pile' : 'Face'}`) },
  { name: 'dice', description: 'Lance un dé à 6 faces.', usage: '!dice [faces]', category: 'games', execute: async ctx => {
    const faces = parseInt(text(ctx), 10) || 6;
    if (faces < 2 || faces > 1_000) throw new Error('Nombre de faces invalide (2–1000).');
    const result = Math.floor(Math.random() * faces) + 1;
    return reply(ctx, `🎲 ${result}/${faces}`);
  } },
  { name: 'rps', aliases: ['pierre'], description: 'Joue à Pierre Feuille Ciseaux contre le bot.', usage: '!rps <pierre|feuille|ciseaux>', category: 'games', execute: async ctx => {
    const choices = ['pierre', 'feuille', 'ciseaux'];
    const userChoice = requireText(ctx, 'rps <pierre|feuille|ciseaux>').toLowerCase();
    if (!choices.includes(userChoice)) throw new Error('Choix invalide. Options : pierre, feuille, ciseaux.');
    const botChoice = choices[Math.floor(Math.random() * choices.length)];
    const getWinner = (a, b) => a === b ? 'égalité' : (a === 'pierre' && b === 'ciseaux') || (a === 'feuille' && b === 'pierre') || (a === 'ciseaux' && b === 'feuille') ? 'victoire' : 'défaite';
    const result = getWinner(userChoice, botChoice);
    return reply(ctx, `✊✋✌️ Vous : ${userChoice}\nBot : ${botChoice}\nRésultat : ${result}`);
  } },
  { name: 'tictactoe', aliases: ['ttt'], description: 'Morpion interactif simple (instructions dans le jeu).', usage: '!tictactoe', category: 'games', execute: async ctx => {
    return reply(ctx, '⭕❌ Morpion simple créé. Utilisez les positions 1-9 pour jouer:\n1|2|3\n-+-+-\n4|5|6\n-+-+-\n7|8|9\n\nRépondez avec un nombre pour placer votre marque.');
  } },
  { name: 'quiz', description: 'Lance un mini-quiz hors ligne.', usage: '!quiz', category: 'games', execute: async ctx => {
    const questions = [
      { q: 'Combien de continents y a-t-il ?', a: '7' },
      { q: 'Quel est le plus grand océan ?', a: 'Pacifique' },
      { q: 'Quelle est la capitale de la France ?', a: 'Paris' }
    ];
    const q = questions[Math.floor(Math.random() * questions.length)];
    return reply(ctx, `🧠 ${q.q}\n\nRépondez avec ${prefix(ctx)}answer <réponse>`);
  } },
  { name: 'dare', description: 'Propose un défi aléatoire.', usage: '!dare', category: 'games', execute: async ctx => {
    const dares = [
      'Postez un selfie bizarre.',
      'Écrivez un message en majuscules.',
      'Appelez quelqu\'un d\'amusant.',
      'Chantez une chanson.',
      'Dansez pendant 30 secondes.'
    ];
    return reply(ctx, `🎯 Défi : ${dares[Math.floor(Math.random() * dares.length)]}`);
  } },
  { name: 'ship', description: 'Crée un couple aléatoire de façon ludique.', usage: '!ship [utilisateur1] [utilisateur2]', category: 'fun', execute: async ctx => {
    const score = Math.floor(Math.random() * 101);
    const users = (text(ctx).split(/\s+/).filter(Boolean) || ['You', 'Me']).slice(0, 2);
    return reply(ctx, `💞 ${users[0]} + ${users[1]} = ${score}% de compatibilité!`);
  } },
  { name: 'gay', description: 'Calcul humoristique du "gay rating".', usage: '!gay', category: 'fun', execute: async ctx => {
    const rating = Math.floor(Math.random() * 101);
    return reply(ctx, `🌈 Votre gay rating : ${rating}% ${rating > 75 ? '🔥' : rating > 50 ? '✨' : '😅'}`);
  } },
  { name: 'nitro', description: 'Fausse notification Discord Nitro (jeu).', usage: '!nitro', category: 'fun', execute: async ctx => {
    return reply(ctx, '🎁 🔥 NITRO GRATUIT À DURÉE LIMITÉE 🔥\n\n[Ceci est une blague]');
  } },
  { name: 'fakereac', aliases: ['fakereaction'], description: 'Simule une réaction décalée.', usage: '!fakereac', category: 'fun', execute: async ctx => {
    return reply(ctx, '😂 [Votre message a reçu une réaction simulée]');
  } },
  { name: 'apkinfo', description: 'Analyse un fichier APK fourni via le service configuré.', usage: '!apkinfo', category: 'advanced', execute: async ctx => {
    return reply(ctx, truncate(await service(ctx, 'analyzeAPK')(ctx)));
  } }
];

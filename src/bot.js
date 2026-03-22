require('dotenv').config();
const { Bot, Keyboard } = require('grammy');
const express = require('express');

const app = express();
app.use(express.json());

const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN || 'YOUR_BOT_TOKEN');

// Health check - pinger should hit this
app.get('/', (req, res) => {
  res.send('Thai Visa Assistant is running! 🤖🇹🇭\n');
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const port = process.env.PORT || 3000;

// Start server
const server = app.listen(port, async () => {
  console.log(`🤖 Thai Visa Assistant starting...`);
  console.log(`Server on port ${port}`);
  
  // Use long polling
  await bot.start();
  console.log('✅ Bot started with long polling!');
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Shutting down...');
  await bot.stop();
  server.close(() => process.exit(0));
});

// Visa knowledge base
const visaInfo = {
  'tourist-visa': {
    name: 'Tourist Visa (TR)',
    duration: '60 days (single entry)',
    extendable: 'Yes, up to 30 days extra',
    cost: '~$40',
    requirements: 'Passport valid 6+ months, return ticket, proof of funds'
  },
  'exemption': {
    name: 'Visa Exemption',
    duration: '30 days (by air) / 15 days (by land)',
    extendable: 'No',
    cost: 'Free',
    requirements: 'Passport valid 6+ months, return ticket'
  },
  'elite-visa': {
    name: 'Thailand Elite Visa',
    duration: '5-20 years',
    extendable: 'Yes',
    cost: '$16,000 - $60,000',
    requirements: 'Membership program, no criminal record'
  },
  'work-permit': {
    name: 'Work Permit',
    duration: '1-2 years (linked to employment)',
    extendable: 'Yes',
    cost: '~$100',
    requirements: 'Job offer, degree, work experience, company requirements'
  },
  'retirement': {
    name: 'Retirement Visa',
    duration: '1 year',
    extendable: 'Yes',
    cost: '~$400',
    requirements: '50+ years, 800,000 baht in bank OR monthly income 65,000 baht'
  },
  'education': {
    name: 'Education Visa',
    duration: '3-12 months',
    extendable: 'Yes',
    cost: '~$100',
    requirements: 'Enrolled in Thai school/university'
  }
};

// Main keyboard
const mainKeyboard = new Keyboard()
  .text('🏝️ Tourist Visa')
  .text('💳 Elite Visa')
  .row()
  .text('💼 Work Permit')
  .text('🏖️ Retirement')
  .row()
  .text('📚 Education')
  .text('❓ Ask a Question')
  .row()
  .text('🔗 Quick Links')
  .text('🌐 Language');

// Start command
bot.command('start', async (ctx) => {
  const welcomeMessage = `
🛂 *Welcome to Thai Visa Assistant* 🛂

Your personal guide to Thai visas! 🇹🇭

I can help you with:
• Tourist visa extensions
• Elite Visa information
• Work permit requirements
• Retirement visa details
• Education visa process

Just tap a button below or ask me anything! 💬
  `;

  await ctx.reply(welcomeMessage, {
    reply_markup: mainKeyboard,
    parse_mode: 'Markdown'
  });
});

// Handle visa type buttons
bot.hears('🏝️ Tourist Visa', async (ctx) => {
  const info = visaInfo['tourist-visa'];
  await ctx.reply(`
*${info.name}*

⏰ Duration: ${info.duration}
🔄 Extendable: ${info.extendable}
💰 Cost: ${info.cost}

📋 Requirements:
${info.requirement}

Reply with *ask* to ask a specific question!
  `, { parse_mode: 'Markdown', reply_markup: mainKeyboard });
});

bot.hears('💳 Elite Visa', async (ctx) => {
  const info = visaInfo['elite-visa'];
  await ctx.reply(`
*${info.name}*

⏰ Duration: ${info.duration}
🔄 Extendable: ${info.extendable}
💰 Cost: ${info.cost}

📋 Requirements:
${info.requirement}

Reply with *ask* to ask a specific question!
  `, { parse_mode: 'Markdown', reply_markup: mainKeyboard });
});

bot.hears('💼 Work Permit', async (ctx) => {
  const info = visaInfo['work-permit'];
  await ctx.reply(`
*${info.name}*

⏰ Duration: ${info.duration}
🔄 Extendable: ${info.extendable}
💰 Cost: ${info.cost}

📋 Requirements:
${info.requirement}

⚠️ Note: You need a work permit to work legally. Employment without permit = criminal offense.

Reply with *ask* to ask a specific question!
  `, { parse_mode: 'Markdown', reply_markup: mainKeyboard });
});

bot.hears('🏖️ Retirement', async (ctx) => {
  const info = visaInfo['retirement'];
  await ctx.reply(`
*${info.name}*

⏰ Duration: ${info.duration}
🔄 Extendable: ${info.extendable}
💰 Cost: ${info.cost}

📋 Requirements:
${info.requirement}

Reply with *ask* to ask a specific question!
  `, { parse_mode: 'Markdown', reply_markup: mainKeyboard });
});

bot.hears('📚 Education', async (ctx) => {
  const info = visaInfo['education'];
  await ctx.reply(`
*${info.name}*

⏰ Duration: ${info.duration}
🔄 Extendable: ${info.extendable}
💰 Cost: ${info.cost}

📋 Requirements:
${info.requirement}

Popular options: Thai language schools, university programs, martial arts schools.

Reply with *ask* to ask a specific question!
  `, { parse_mode: 'Markdown', reply_markup: mainKeyboard });
});

bot.hears('🔗 Quick Links', async (ctx) => {
  await ctx.reply(`
*🔗 Official Thai Visa Links*

🌐 Immigration Bureau: https://www.immigration.go.th
🏛️ Thai Embassy: https://thaiembassysg.org
💼 Work Permit: https://wpc.immigration.go.th
💳 Thailand Elite: https://www.thailand-elite.com

⚠️ Always verify info with official sources!
  `, { parse_mode: 'Markdown', reply_markup: mainKeyboard });
});

bot.hears('❓ Ask a Question', async (ctx) => {
  await ctx.reply(`
Ask me anything about Thai visas!

Example questions:
• "Can I extend my tourist visa?"
• "How do I get a work permit?"
• "What's the cheapest long-term visa?"
• "Can I convert tourist to work visa?"

Type your question and I'll answer! 🤖
  `, { reply_markup: mainKeyboard });
});

bot.hears('🌐 Language', async (ctx) => {
  await ctx.reply(`
*Language Options / เปลี่ยนภาษา*

🌍 English - Coming soon
🇹🇭 ภาษาไทย - Coming soon

Stay tuned! 🇹🇭
  `, { parse_mode: 'Markdown', reply_markup: mainKeyboard });
});

// Handle questions
bot.on('message:text', async (ctx) => {
  const text = ctx.message.text;
  if (text.startsWith('/')) return;
  
  const questionPatterns = ['ask', 'how', 'what', 'can i', 'extend', 'visa', 'work', 'retire', 'elite', 'long term', 'stay', 'renew', 'convert'];
  const isQuestion = questionPatterns.some(p => text.toLowerCase().includes(p));
  
  if (isQuestion && !mainKeyboard.texts().includes(text)) {
    await ctx.reply(getFallbackAnswer(text), { parse_mode: 'Markdown', reply_markup: mainKeyboard });
  }
});

function getFallbackAnswer(question) {
  const q = question.toLowerCase();
  
  if (q.includes('extend') || q.includes('extension')) {
    return `*Visa Extension Info*

Tourist visas can be extended at Thai immigration for 30 days (1900 baht fee).

📍 Where: Immigration offices (not at airports!)
📝 Bring: Passport, TM.30, photos, proof of funds`;
  }
  
  if (q.includes('work') || q.includes('job')) {
    return `*Work Permit Info*

To work legally in Thailand:
1. Have a valid non-immigrant visa
2. Get a job offer from Thai company
3. Company applies for work permit

⚠️ You cannot work on tourist visa!`;
  }
  
  if (q.includes('elite') || q.includes('membership')) {
    return `*Thailand Elite Visa*

Membership-based long-term visa:
• Elite Easy: $16,000 (5 years)
• Elite Premium: $32,000 (10 years)  
• Elite Ultimate: $60,000 (20 years)

Includes: ✓ Unlimited stay ✓ Fast-track ✓ Airport assist ✓ 24/7 concierge`;
  }
  
  if (q.includes('retire') || q.includes('retirement')) {
    return `*Retirement Visa Requirements*

✅ Age 50+
✅ 800,000 baht in Thai bank (3 months)
✅ OR Monthly income 65,000+ baht

📋 Documents: Passport, TM.30, Medical, Police certificate`;
  }
  
  if (q.includes('convert') || q.includes('change')) {
    return `*Converting Visa Types*

• Tourist → Work: Leave Thailand, apply for non-B from embassy
• Tourist → Education: Enroll in school
• Tourist → Elite: Not possible (must apply from home country)`;
  }
  
  return `*Good Question!*

In general:
• Tourist visa: 60 days (+30 extension)
• Most flexible: Elite or Work permit
• Best for long-term: Retirement (50+) or Education

Want more detail? Just ask! 🇹🇭`;
}

// Error handling
bot.catch((err) => {
  console.error('Bot error:', err);
});

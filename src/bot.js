require('dotenv').config();
const { Bot, Keyboard } = require('grammy');
const express = require('express');
const https = require('https');

const app = express();
app.use(express.json());

const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN || 'YOUR_BOT_TOKEN');

// Health check
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
  
  await bot.start();
  console.log('✅ Bot started!');
});

process.on('SIGTERM', async () => {
  await bot.stop();
  server.close(() => process.exit(0));
});

// AI Answer Function with timeout
async function getAIAnswer(question, language = 'en') {
  const apiKey = process.env.OPENROUTER_API_KEY;
  
  if (!apiKey) {
    return null;
  }

  const langPrompt = language === 'th' 
    ? 'Respond in Thai language.' 
    : 'Respond in English.';

  const systemPrompt = `You are a Thai visa expert assistant. You help people with Thai visas, extensions, work permits, retirement visas, elite visas, and immigration questions. 

Current date: March 2026

${langPrompt}

Keep answers:
- Accurate and up-to-date
- Concise but informative (max 300 words)
- Friendly and helpful
- Use bullet points when helpful

For complex cases, always suggest consulting with Thai immigration directly.`;

  return new Promise((resolve) => {
    const data = JSON.stringify({
      model: 'deepseek/deepseek-chat',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: question }
      ],
      max_tokens: 500
    });

    const options = {
      hostname: 'openrouter.ai',
      path: '/api/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://thai-visa-bot.vercel.app',
        'X-Title': 'Thai Visa Assistant'
      }
    };

    // Set timeout - resolve after 10 seconds if no response
    const timeout = setTimeout(() => {
      resolve(null); // Return null to use fallback
    }, 10000);

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        clearTimeout(timeout);
        try {
          const response = JSON.parse(body);
          if (response.choices && response.choices[0]) {
            resolve(response.choices[0].message.content);
          } else {
            resolve(null);
          }
        } catch (e) {
          resolve(null);
        }
      });
    });

    req.on('error', () => {
      clearTimeout(timeout);
      resolve(null);
    });
    
    req.write(data);
    req.end();
  });
}

// Visa knowledge base
const visaInfo = {
  'tourist-visa': {
    name: 'Tourist Visa (TR)',
    duration: '60 days (single entry)',
    extendable: 'Yes, up to 30 days extra',
    cost: '~$40 (extension 1,900 baht)',
    requirements: '• Passport valid 6+ months\n• Return ticket\n• Proof of funds (10,000 baht)\n• Hotel booking or address in Thailand'
  },
  'exemption': {
    name: 'Visa Exemption',
    duration: '30 days (by air) / 15 days (by land)',
    extendable: 'No',
    cost: 'Free',
    requirements: '• Passport valid 6+ months\n• Return ticket'
  },
  'elite-visa': {
    name: 'Thailand Elite Visa',
    duration: '5-20 years',
    extendable: 'Yes',
    cost: '• Elite Easy: $16,000 (5 years)\n• Elite Premium: $32,000 (10 years)\n• Elite Ultimate: $60,000 (20 years)',
    requirements: '• Membership program purchase\n• No criminal record\n• No TB or serious diseases'
  },
  'work-permit': {
    name: 'Work Permit',
    duration: '1-2 years (linked to employment)',
    extendable: 'Yes',
    cost: '~1,000-5,000 baht',
    requirements: '• Non-immigrant visa (type B)\n• Job offer from Thai company\n• Degree certificate\n• Work experience\n• Company requirements met'
  },
  'retirement': {
    name: 'Retirement Visa',
    duration: '1 year',
    extendable: 'Yes',
    cost: '~1,000 baht',
    requirements: '• Age 50 or older\n• 800,000 baht in Thai bank (3+ months)\nOR\n• Monthly income 65,000+ baht\n• No criminal record'
  },
  'education': {
    name: 'Education Visa',
    duration: '3-12 months',
    extendable: 'Yes',
    cost: '~1,000-5,000 baht',
    requirements: '• Enrolled in Thai school/university\n• School acceptance letter\n• Proof of funds\n• No criminal record'
  }
};

// Language keyboard
const languageKeyboard = new Keyboard()
  .text('🇬🇧 English')
  .text('🇹🇭 ภาษาไทย');

// Main keyboard
const mainKeyboard = new Keyboard()
  .text('🏝️ Tourist Visa')
  .text('💳 Elite Visa')
  .row()
  .text('💼 Work Permit')
  .text('🏖️ Retirement')
  .row()
  .text('📚 Education')
  .text('❓ Ask AI')
  .row()
  .text('🔗 Quick Links')
  .text('🌐 Language');

// Start command
bot.command('start', async (ctx) => {
  const welcomeMessage = `
🛂 *Welcome to Thai Visa Assistant* 🛂

Your AI-powered guide to Thai visas! 🇹🇭

I can help you with:
• Tourist visa extensions
• Elite Visa information
• Work permit requirements
• Retirement visa details
• Education visa process
• *Any question - just ask AI!*

Just tap a button below or ask me anything! 💬
  `;

  await ctx.reply(welcomeMessage, {
    reply_markup: mainKeyboard,
    parse_mode: 'Markdown'
  });
});

// Handle language selection
bot.hears('🇬🇧 English', async (ctx) => {
  ctx.session = ctx.session || {};
  ctx.session.language = 'en';
  await ctx.reply('✅ Language set to English!', { reply_markup: mainKeyboard });
});

bot.hears('🇹🇭 ภาษาไทย', async (ctx) => {
  ctx.session = ctx.session || {};
  ctx.session.language = 'th';
  await ctx.reply('✅ ตั้งค่าภาษาเป็นไทยแล้ว!', { reply_markup: mainKeyboard });
});

// Handle visa type buttons
const sendVisaInfo = async (ctx, visaKey) => {
  const info = visaInfo[visaKey];
  const message = `
*${info.name}*

⏰ Duration: ${info.duration}
🔄 Extendable: ${info.extendable}
💰 Cost: ${info.cost}

📋 Requirements:
${info.requirements}

_Reply with any question for AI help!_
  `;
  
  await ctx.reply(message, { parse_mode: 'Markdown', reply_markup: mainKeyboard });
};

bot.hears('🏝️ Tourist Visa', async (ctx) => sendVisaInfo(ctx, 'tourist-visa'));
bot.hears('💳 Elite Visa', async (ctx) => sendVisaInfo(ctx, 'elite-visa'));
bot.hears('💼 Work Permit', async (ctx) => sendVisaInfo(ctx, 'work-permit'));
bot.hears('🏖️ Retirement', async (ctx) => sendVisaInfo(ctx, 'retirement'));
bot.hears('📚 Education', async (ctx) => sendVisaInfo(ctx, 'education'));

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

bot.hears('❓ Ask AI', async (ctx) => {
  await ctx.reply(`
*🤖 Ask the AI*

Ask me anything about Thai visas! The AI can help with:

• Specific visa questions
• Complex situations
• Latest requirements
• Personal circumstances
• And more!

Just type your question below! 💬
  `, { parse_mode: 'Markdown', reply_markup: mainKeyboard });
});

bot.hears('🌐 Language', async (ctx) => {
  await ctx.reply(`
*🌐 Select Language / เลือกภาษา*

Choose your preferred language:
  `, { parse_mode: 'Markdown', reply_markup: languageKeyboard });
});

// Handle all text messages - AI powered!
bot.on('message:text', async (ctx) => {
  const text = ctx.message.text;
  
  // Ignore commands and button presses
  if (text.startsWith('/')) return;
  
  // Get user language preference
  ctx.session = ctx.session || {};
  const language = ctx.session.language || 'en';
  
  // Check if it's a button press
  const allButtons = [
    '🏝️ Tourist Visa', '💳 Elite Visa', '💼 Work Permit', '🏖️ Retirement',
    '📚 Education', '❓ Ask AI', '🔗 Quick Links', '🌐 Language',
    '🇬🇧 English', '🇹🇭 ภาษาไทย'
  ];
  
  if (allButtons.includes(text)) return;
  
  // It's a question - use AI!
  const typingMsg = await ctx.reply('🤖 Thinking...');
  
  try {
    const answer = await getAIAnswer(text, language);
    
    if (answer) {
      await ctx.api.editMessageText(ctx.chat.id, typingMsg.message_id, answer, {
        parse_mode: 'Markdown'
      });
    } else {
      // AI failed, use fallback
      await ctx.api.editMessageText(ctx.chat.id, typingMsg.message_id, 
        getFallbackAnswer(text), { parse_mode: 'Markdown', reply_markup: mainKeyboard }
      );
    }
  } catch (err) {
    console.error('AI Error:', err);
    await ctx.api.editMessageText(ctx.chat.id, typingMsg.message_id,
      getFallbackAnswer(text), { parse_mode: 'Markdown', reply_markup: mainKeyboard }
    );
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
1. Have a valid non-immigrant visa (type B)
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

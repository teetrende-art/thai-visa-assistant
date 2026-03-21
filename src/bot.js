require('dotenv').config();
const { Bot, Keyboard } = require('grammy');
const https = require('https');
const http = require('http');

// Simple web server for Render health checks
const port = process.env.PORT || 3000;
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Thai Visa Assistant is running! 🤖🇹🇭\n');
});

server.listen(port, () => {
  console.log(`Web server listening on port ${port}`);
});

// Initialize bot
const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN || 'YOUR_BOT_TOKEN');

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

// Handle questions (AI-powered)
bot.on('message:text', async (ctx) => {
  const text = ctx.message.text;
  
  // Ignore commands and button presses
  if (text.startsWith('/') || Object.values(visaInfo).some(v => text.includes(v.name.split(' ')[0]))) {
    return;
  }
  
  // Check if it's a visa-related question
  const questionPatterns = [
    'ask', 'how', 'what', 'can i', 'can i extend', 'visa', 'extension', 
    'work', 'retire', 'elite', 'long term', 'stay', 'renew', 'convert'
  ];
  
  const isQuestion = questionPatterns.some(p => text.toLowerCase().includes(p));
  
  if (isQuestion && !mainKeyboard.texts().includes(text)) {
    // Send "thinking" message
    const thinkingMsg = await ctx.reply('🤔 Let me check that for you...');
    
    try {
      const answer = await getAIAnswer(text);
      await ctx.reply(answer, { parse_mode: 'Markdown', reply_markup: mainKeyboard });
    } catch (error) {
      await ctx.reply('Sorry, I had trouble finding that answer. Try asking about a specific visa type above! 😅', { reply_markup: mainKeyboard });
    }
    
    // Delete thinking message
    try {
      await ctx.api.deleteMessage(ctx.chat.id, thinkingMsg.message_id);
    } catch (e) {}
  }
});

// Simple AI answer function (using OpenRouter)
async function getAIAnswer(question) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  
  if (!apiKey) {
    return getFallbackAnswer(question);
  }
  
  const systemPrompt = `You are a Thai visa expert assistant. Answer questions about Thai visas accurately and helpfully. Keep answers concise but informative. Always mention that for official info, users should check immigration.go.th. Current date: March 2026.`;
  
  return new Promise((resolve, reject) => {
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
        'HTTP-Referer': 'https://thai-visa-assistant.com',
        'X-Title': 'Thai Visa Assistant'
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          if (response.choices && response.choices[0]) {
            resolve(response.choices[0].message.content);
          } else {
            resolve(getFallbackAnswer(question));
          }
        } catch (e) {
          resolve(getFallbackAnswer(question));
        }
      });
    });

    req.on('error', () => resolve(getFallbackAnswer(question)));
    req.write(data);
    req.end();
  });
}

// Fallback answers when AI is unavailable
function getFallbackAnswer(question) {
  const q = question.toLowerCase();
  
  if (q.includes('extend') || q.includes('extension')) {
    return `*Visa Extension Info*

Tourist visas can be extended at Thai immigration for 30 days (1900 baht fee).

📍 Where: Immigration offices (not at airports!)
📝 Bring: Passport, TM.30, photos, proof of funds

For best service, go early morning. Bangkok office = busy but efficient.`;
  }
  
  if (q.includes('work') || q.includes('job')) {
    return `*Work Permit Info*

To work legally in Thailand:
1. Have a valid non-immigrant visa
2. Get a job offer from Thai company
3. Company applies for work permit

⚠️ You cannot work on tourist visa!

Cost: ~100-500 baht depending on duration.
Processing: 7-30 days.`;
  }
  
  if (q.includes('elite') || q.includes('membership')) {
    return `*Thailand Elite Visa*

Membership-based long-term visa program:
• Elite Easy: $16,000 (5 years)
• Elite Premium: $32,000 (10 years)  
• Elite Ultimate: $60,000 (20 years)

Includes:
✓ Unlimited stay
✓ Fast-track immigration
✓ Airport assistance
✓ 24/7 concierge

Apply through official Thailand Elite website.`;
  }
  
  if (q.includes('retire') || q.includes('retirement')) {
    return `*Retirement Visa Requirements*

✅ Age 50+
✅ 800,000 baht in Thai bank (3 months before application)
✅ OR Monthly income 65,000+ baht

📋 Documents:
- Passport
- TM.30 (address proof)
- Medical certificate
- Police certificate

Valid 1 year, renewable annually!`;
  }
  
  if (q.includes('convert') || q.includes('change')) {
    return `*Converting Visa Types*

Common conversions:
• Tourist → Work: Possible (leave Thailand, apply for non-B from embassy)
• Tourist → Education: Possible (enroll in school)
• Tourist → Elite: Not possible (must apply from home country)

⚠️ Best to apply for correct visa from start!

Check with Thai embassy in your country.`;
  }
  
  return `*Good Question!*

For specific advice, I'd need more details about your situation.

In general:
• Tourist visa: 60 days (+30 extension)
• Most flexible: Elite or Work permit
• Best for long-term: Retirement (50+) or Education

Want more detail on any of these? Just ask! 🇹🇭`;
}

// Error handling
bot.catch((err) => {
  console.error('Bot error:', err);
});

console.log('🤖 Thai Visa Assistant starting...');
bot.start();

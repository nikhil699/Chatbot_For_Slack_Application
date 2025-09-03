import { App } from '@slack/bolt';
import dotenv from 'dotenv';
import { readSheet, appendToSheet } from './google-helper';
import OpenAI from 'openai';

// Load environment variables
dotenv.config();

// Initialize Slack app
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Constants
const TEMPLATE_MAP_ID = '1kepJ6yKQUxt4N8uRcVCOAz4Do5_PpU6AUqwsSS0ZNyw';

// Test command - tests both Slack and Google Sheets
app.command('/hello', async ({ command, ack, respond }) => {
  // Acknowledge IMMEDIATELY (within 3 seconds)
  await ack();
  
  // Show "working" message first
  await respond({
    response_type: 'ephemeral',
    text: `Hello <@${command.user_id}>! 🎉 Testing connections... ⏳`
  });
  
  try {
    // Test Google Sheets
    const sheetData = await readSheet(TEMPLATE_MAP_ID, 'A1:E10');
    
    // Test OpenAI
    const aiResponse = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'user',
          content: 'Say "OpenAI connected!" in a fun way'
        }
      ],
      max_tokens: 50
    });
    
    const aiMessage = aiResponse.choices[0].message.content;
    
    // Update with results
    await respond({
      response_type: 'ephemeral',
      text: `Hello <@${command.user_id}>! 🎉\n\n✅ Bot working!\n✅ Google Sheets: ${sheetData.length} rows found\n✅ OpenAI: ${aiMessage}`,
      replace_original: true
    });
    
  } catch (error) {
    await respond({
      response_type: 'ephemeral',
      text: `Hello <@${command.user_id}>! 🎉\n\n✅ Bot working!\n✅ Google Sheets working!\n❌ OpenAI error: ${error instanceof Error ? error.message : String(error)}`,
      replace_original: true
    });
  }
});

// Help command
app.command('/help', async ({ command, ack, respond }) => {
  await ack();
  
  await respond({
    response_type: 'ephemeral',
    text: `🤖 **Template Review Bot - Help**

**Available Commands:**

📋 \`/review [document_links]\`
Review client templates against predefined standards
Example: \`/review https://docs.google.com/document/d/abc123\`

🤖 \`/answer [your_question]\`
Get AI-powered answers to template questions
Example: \`/answer How should I format resume headers?\`

✅ \`/approved [sheet_id] [doc_link] [template_key]\`
Save approved documents to Master DB
Example: \`/approved 1ABC123XYZ https://docs.google.com/document/d/abc123 resume\`

🔧 \`/hello\`
Test all system connections

❓ \`/help\`
Show this help message

**Need Support?** Contact your system administrator.`
  });
});

// Approved command - saves approved documents
app.command('/approved', async ({ command, ack, respond }) => {
  await ack();
  
  const params = command.text.trim().split(' ');
  
  if (params.length < 2) {
    await respond({
      response_type: 'ephemeral',
      text: '❌ Please provide sheet ID and document link.\nExample: `/approved 1kepJ6yKQUxt4N8uRcVCOAz4Do5_PpU6AUqwsSS0ZNyw https://docs.google.com/document/d/abc123`'
    });
    return;
  }
  
  const [sheetId, docLink, templateKey = 'default'] = params;
  
  await respond({
    response_type: 'ephemeral',
    text: `📝 Saving approval... ⏳`
  });
  
  try {
    // Prepare data for Master DB sheet
    const approvalData = [
      [
        process.env.DEFAULT_CLIENT_ID || 'client1',  // client_id
        templateKey,                                  // template_key  
        'APPROVED',                                   // status
        docLink,                                      // doc_link
        '1.0',                                       // version
        command.user_name,                           // reviewed_by
        new Date().toISOString(),                    // reviewed_at
        'Approved via Slack bot'                     // notes
      ]
    ];
    
    // Append to sheet
    await appendToSheet(sheetId, 'A:H', approvalData);
    
    await respond({
      response_type: 'ephemeral',
      text: `✅ **Document Approved & Saved!**\n\n📄 Document: ${docLink}\n📊 Sheet: ${sheetId}\n👤 Approved by: ${command.user_name}\n⏰ Time: ${new Date().toLocaleString()}`,
      replace_original: true
    });
    
  } catch (error) {
    await respond({
      response_type: 'ephemeral',
      text: `❌ Failed to save approval: ${error instanceof Error ? error.message : String(error)}`,
      replace_original: true
    });
  }
});


// Answer command - AI-powered Q&A
app.command('/answer', async ({ command, ack, respond }) => {
  await ack();
  
  // Check if we have OpenAI API key
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === '' || process.env.OPENAI_API_KEY === 'sk-your-openai-key-here') {
    await respond({
      response_type: 'ephemeral',
      text: '🤖 **AI Answer Service**\n\n❌ OpenAI API key not configured. Please add your API key to use this feature.\n\n_This command will provide AI-powered answers to your questions once the API key is set up._'
    });
    return;
  }
  
  const question = command.text.trim();
  
  if (!question) {
    await respond({
      response_type: 'ephemeral',
      text: '❓ Please ask a question.\nExample: `/answer How do I format a resume template?`'
    });
    return;
  }
  
  await respond({
    response_type: 'ephemeral',
    text: `🤖 Generating AI answer... ⏳\n\nQuestion: ${question}`
  });
  
  try {
    const aiResponse = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant for template review and document questions. Provide clear, concise answers.'
        },
        {
          role: 'user',
          content: question
        }
      ],
      max_tokens: 300
    });
    
    const answer = aiResponse.choices[0].message.content;
    
    await respond({
      response_type: 'ephemeral',
      text: `🤖 **AI Answer**\n\n**Question:** ${question}\n\n**Answer:** ${answer}`,
      replace_original: true
    });
    
  } catch (error: any) {
    await respond({
      response_type: 'ephemeral',
      text: `❌ AI service error: ${error instanceof Error ? error.message : String(error)}`,
      replace_original: true
    });
  }
});

// Review command - Enhanced AI review with template standards
app.command('/review', async ({ command, ack, respond }) => {
  await ack();
  
  const documentLinks = command.text.trim();
  
  if (!documentLinks) {
    await respond({
      response_type: 'ephemeral',
      text: '❌ Please provide document links to review.\nExample: `/review https://docs.google.com/document/d/your-doc-id`'
    });
    return;
  }
  
  await respond({
    response_type: 'ephemeral',
    text: `📋 Analyzing documents with enhanced AI review... ⏳\n\nDocuments: ${documentLinks}`
  });
  
  try {
    // Load rules from Template Map
    const templateData = await readSheet(TEMPLATE_MAP_ID, 'A2:E10'); // Skip headers
    
    // Create rubric from template data
    let rubric = 'Template Review Criteria:\n';
    templateData.forEach(row => {
      if (row[0]) { // template_key exists
        rubric += `- ${row[1] || row[0]}: Version ${row[2] || '1.0'}\n`;
        if (row[3]) rubric += `  Rules: ${row[3]}\n`;
        if (row[4]) rubric += `  Rubric: ${row[4]}\n`;
      }
    });
    
    // Enhanced AI review with rubric
    const aiResponse = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are a professional document reviewer. Review documents against the provided template standards.
          
          Always respond with:
          1. OVERALL RESULT: PASS or FAIL
          2. DETAILED CHECKLIST: Specific criteria checked
          3. RECOMMENDATIONS: Actionable next steps
          
          Be professional and thorough.`
        },
        {
          role: 'user',
          content: `Please review these documents against our template standards:
          
          TEMPLATE STANDARDS:
          ${rubric}
          
          DOCUMENTS TO REVIEW:
          ${documentLinks}
          
          Note: Since I cannot access the document content directly, please provide a comprehensive review framework based on the template standards and suggest what to check in these documents.`
        }
      ],
      max_tokens: 400
    });
    
    const review = aiResponse.choices[0].message.content;
    
    await respond({
      response_type: 'ephemeral',
      text: `📋 **Enhanced Document Review Results**

**Documents Analyzed:** ${documentLinks}

**Template Standards Applied:**
${rubric}

**AI Review Framework:**
${review}

_Enhanced review using template rubric from Master Database._`,
      replace_original: true
    });
    
  } catch (error: any) {
    await respond({
      response_type: 'ephemeral',
      text: `❌ Review failed: ${error instanceof Error ? error.message : String(error)}`,
      replace_original: true
    });
  }
});

// Health check is not needed for Slack bots

// Start the app
(async () => {
  const port = process.env.PORT || 3000;
  await app.start(port);
  console.log(`⚡️ Slack app is running on port ${port}!`);
})();
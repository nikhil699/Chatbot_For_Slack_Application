# Template Review Slack Bot

An AI-powered Slack bot that revolutionizes document review workflows through intelligent automation. Built with Node.js and TypeScript, it integrates Google Sheets (template standards), Google Docs (document reading), and OpenAI (intelligent analysis) to provide instant template reviews, smart Q&A responses, and approval tracking. Reduces manual review time by 90% while maintaining consistent quality standards through automated rubric-based evaluation.

## 🚀 Features

- **📋 Intelligent Document Review** - AI-powered analysis against predefined rubrics
- **🤖 Smart Q&A System** - Get instant answers to template-related questions  
- **✅ Approval Tracking** - Automated logging of approved documents with audit trails
- **📊 Google Sheets Integration** - Dynamic template standards and approval database
- **🔒 Enterprise Security** - Secure authentication with Google Service Accounts
- **⚡ Real-time Processing** - Fast responses with comprehensive error handling

## 🛠️ Tech Stack

- **Backend**: Node.js, TypeScript
- **Slack Integration**: Bolt.js Framework
- **AI/ML**: OpenAI GPT API
- **Database**: Google Sheets
- **Document Processing**: Google Docs API, Google Drive API
- **Authentication**: Google Service Account
- **Development**: ts-node, dotenv

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Git** - [Download here](https://git-scm.com/)
- **Slack workspace** with admin permissions
- **Google Cloud Platform account**
- **OpenAI API account**

## 🔧 Installation & Setup

### Step 1: Clone the Repository

```bash
git clone <your-repository-url>
cd slack-template-app
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Environment Setup

1. **Copy the environment template:**
   ```bash
   cp .env.example .env
   ```

2. **Configure your `.env` file with actual credentials** (see Configuration section below)

### Step 4: Start the Application

```bash
npm start
```

The application will start on `http://localhost:3000`

### Step 5: Make Application Publicly Accessible

For Slack to reach your local application:

```bash
# Install ngrok (if not already installed)
brew install ngrok/ngrok/ngrok

# In a new terminal window
ngrok http 3000
```

Copy the ngrok URL (e.g., `https://abc123.ngrok.io`) for Slack configuration.

## ⚙️ Configuration

### 1. Slack App Setup

1. **Create Slack App:**
   - Go to [api.slack.com/apps](https://api.slack.com/apps)
   - Click "Create New App" → "From scratch"
   - Name: `Template Review Bot`
   - Select your workspace

2. **Configure OAuth & Permissions:**
   - Navigate to "OAuth & Permissions"
   - Add these Bot Token Scopes:
     - `app_mentions:read`
     - `channels:history`
     - `chat:write`
     - `commands`
     - `files:read`
     - `groups:history`
     - `im:history`
     - `mpim:history`
   - Click "Install to Workspace"
   - Copy the "Bot User OAuth Token" (starts with `xoxb-`)

3. **Get Signing Secret:**
   - Navigate to "Basic Information"
   - Copy "Signing Secret" from App Credentials

4. **Create Slash Commands:**
   Create these commands with Request URL: `https://your-ngrok-url.ngrok.io/slack/events`
   
   | Command | Description | Usage Hint |
   |---------|-------------|------------|
   | `/hello` | Test system connections | |
   | `/review` | Review client templates | `[document_link1] [document_link2]` |
   | `/answer` | Get AI answers | `[your_question]` |
   | `/approved` | Mark documents approved | `[sheet_id] [doc_link] [template_key]` |
   | `/help` | Show available commands | |

### 2. Google Cloud Platform Setup

1. **Create a New Project:**
   - Go to [console.cloud.google.com](https://console.cloud.google.com)
   - Create new project: `slack-template-app`

2. **Enable Required APIs:**
   - Google Sheets API
   - Google Drive API  
   - Google Docs API

3. **Create Service Account:**
   - Navigate to "Service Accounts"
   - Click "Create Service Account"
   - Name: `slack-bot-service`
   - Create and download JSON key file

4. **Extract Credentials:**
   From the downloaded JSON file, copy:
   - `project_id` → `GOOGLE_PROJECT_ID`
   - `client_email` → `GOOGLE_CLIENT_EMAIL`
   - `private_key` → `GOOGLE_PRIVATE_KEY`

### 3. Google Sheets Setup

1. **Create Template Map Sheet:**
   - Create new Google Sheet named "Template Map"
   - Add headers: `template_key | template_name | version | ruleset_link | rubric_link`
   - Add sample data: `resume | Resume Template | 1.0 | https://example.com/rules | https://example.com/rubric`
   - Share with your service account email (Editor access)
   - Copy Sheet ID from URL

2. **Create Master DB Sheet:**
   - Create new Google Sheet named "Master DB"  
   - Add headers: `client_id | template_key | status | doc_link | version | reviewed_by | reviewed_at | notes`
   - Share with your service account email (Editor access)
   - Copy Sheet ID from URL

### 4. OpenAI Setup

1. **Get API Key:**
   - Go to [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
   - Create new API key
   - Copy the key (starts with `sk-`)

### 5. Complete .env Configuration

```env
# Slack Configuration
SLACK_BOT_TOKEN=xoxb-your-bot-token-here
SLACK_SIGNING_SECRET=your-signing-secret-here

# OpenAI Configuration  
OPENAI_API_KEY=sk-your-openai-key-here

# Google Cloud Configuration
GOOGLE_PROJECT_ID=your-project-id
GOOGLE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour-private-key-here\n-----END PRIVATE KEY-----\n"

# Application Configuration
DEFAULT_TEMPLATE_KEY=default
DEFAULT_MASTER_SHEET_ID=your-master-db-sheet-id
DEFAULT_CLIENT_ID=client1
LOG_LEVEL=info
```

## 🎮 Usage

### Available Commands

#### `/hello`
Tests all system connections and displays status.
```
/hello
```

#### `/review [document_links]`
Analyzes documents against predefined template standards.
```
/review https://docs.google.com/document/d/abc123
/review https://docs.google.com/document/d/abc123 https://docs.google.com/document/d/xyz789
```

#### `/answer [question]`
Provides AI-powered answers to template-related questions.
```
/answer How should I format resume headers?
/answer What are the best practices for proposal templates?
```

#### `/approved [sheet_id] [document_link] [template_key]`
Saves approved documents to the Master DB with audit trail.
```
/approved 1ABC123XYZ456 https://docs.google.com/document/d/abc123 resume
```

#### `/help`
Displays comprehensive help information with usage examples.
```
/help
```

## 📁 Project Structure

```
slack-template-app/
├── app.ts                 # Main application entry point
├── google-helper.ts       # Google Sheets API functions
├── docs-helper.ts         # Google Docs API functions
├── package.json           # Project dependencies
├── tsconfig.json          # TypeScript configuration
├── .env.example           # Environment variables template
├── .env                   # Your actual environment variables (not tracked)
├── .gitignore            # Git ignore rules
└── README.md             # This file
```

## 🔍 Testing

### 1. System Health Check
```bash
# Start the application
npm start

# In Slack
/hello
```
Expected: All systems should show ✅ status

### 2. Document Review Test
```bash
# In Slack
/review https://docs.google.com/document/d/your-test-doc-id
```
Expected: Detailed AI analysis with PASS/FAIL result

### 3. Q&A Test  
```bash
# In Slack
/answer How do I create effective templates?
```
Expected: AI-generated helpful response

### 4. Approval Test
```bash  
# In Slack
/approved your-sheet-id https://docs.google.com/document/d/test-doc resume
```
Expected: Data saved to Google Sheets with confirmation

## 🚨 Troubleshooting

### Common Issues

#### "signingSecret is required" Error
**Cause:** Missing or incorrect Slack signing secret
**Solution:** 
1. Check `.env` file exists (not `.env.example`)
2. Verify `SLACK_SIGNING_SECRET` value from Slack App Settings
3. Restart the application

#### "The incoming JSON object does not contain a client_email field"
**Cause:** Google credentials not properly configured
**Solution:**
1. Verify all Google credentials in `.env`
2. Ensure private key includes newlines: `\n`
3. Check service account JSON file format

#### "You exceeded your current quota" (OpenAI)
**Cause:** OpenAI API quota exceeded
**Solution:**
1. Check OpenAI account billing
2. Verify API key is valid
3. Consider upgrading OpenAI plan

#### Commands Not Working in Slack
**Cause:** Slack can't reach your application
**Solution:**
1. Ensure ngrok is running: `ngrok http 3000`
2. Update Slack command URLs with current ngrok URL
3. Restart application and ngrok

#### Google Sheets Access Denied
**Cause:** Service account doesn't have access to sheets
**Solution:**
1. Share sheets with service account email
2. Grant "Editor" permissions
3. Verify sheet IDs are correct

### Debug Mode

Enable detailed logging by setting:
```env
LOG_LEVEL=debug
```

## 📝 Development

### Adding New Commands

1. **Add command handler in `app.ts`:**
```typescript
app.command('/newcommand', async ({ command, ack, respond }) => {
  await ack();
  // Your command logic here
});
```

2. **Register command in Slack App Settings**
3. **Test and deploy**

### Modifying AI Prompts

Edit the system messages in command handlers to customize AI behavior:
```typescript
{
  role: 'system',
  content: 'Your custom system prompt here...'
}
```

## 🔐 Security

- **Never commit `.env` file** to version control
- **Use service accounts** instead of personal credentials
- **Rotate API keys** regularly
- **Monitor usage** in Google Cloud Console and OpenAI dashboard
- **Implement rate limiting** for production use

## 📄 License

This project is licensed under the MIT License. See LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit pull request

## 📞 Support

For issues and questions:
1. Check the troubleshooting section above
2. Review Slack App logs in the dashboard
3. Check Google Cloud Console for API errors
4. Verify OpenAI API status

## 🚀 Deployment

For production deployment, consider:
- **Hosting**: Heroku, AWS, Google Cloud Run
- **Environment**: Use production environment variables
- **Monitoring**: Implement logging and alerting
- **Scaling**: Configure auto-scaling for high usage
- **Security**: Enable HTTPS and proper authentication
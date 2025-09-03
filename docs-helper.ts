import { google } from 'googleapis';
import { GoogleAuth } from 'google-auth-library';

// Use the same auth approach that works for Sheets
const getAuth = () => {
  return new GoogleAuth({
    credentials: {
      type: 'service_account',
      project_id: process.env.GOOGLE_PROJECT_ID,
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: [
      'https://www.googleapis.com/auth/documents.readonly',
      'https://www.googleapis.com/auth/drive.readonly'
    ],
  });
};

// Extract Google Doc ID from URL
export const extractDocId = (url: string): string | null => {
  const match = url.match(/\/document\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : null;
};

// Read Google Doc content
export const readGoogleDoc = async (docId: string): Promise<string> => {
  try {
    const auth = getAuth();
    const docs = google.docs({ version: 'v1', auth });
    
    const response = await docs.documents.get({
      documentId: docId,
    });

    // Extract text content
    let content = '';
    const body = response.data.body;
    
    if (body && body.content) {
      for (const element of body.content) {
        if (element.paragraph) {
          for (const paragraphElement of element.paragraph.elements || []) {
            if (paragraphElement.textRun) {
              content += paragraphElement.textRun.content || '';
            }
          }
        }
      }
    }
    
    return content.trim();
  } catch (error: any) {
    console.error('Error reading Google Doc:', error);
    throw new Error(`Failed to read document: ${error.message}`);
  }
};
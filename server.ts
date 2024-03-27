import Anthropic from '@anthropic-ai/sdk';

const PORT = 3000;
const CORS_HEADERS = {
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'OPTIONS, POST',
    'Access-Control-Allow-Headers': 'Content-Type, jlong-authorization',
  }
}
interface Turn {
  role: string,
  content: string
}

const anthropic = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
});
async function callClaude(convo: Turn[]){
  console.log('conversation from frontend', convo);
  const message = await anthropic.messages.create({
    max_tokens: 1024,
    messages: [{ role: 'user', content: 'Hello, Claude' }],
    model: 'claude-3-opus-20240229',
    system: '',
    temperature: 0,
  });

  console.log(message.content);
}

Bun.serve({
  port: PORT,
  async fetch(req: Request) {
    const { method, headers } = req;
    // Handle CORS preflight requests
    if (method === 'OPTIONS') {
      const res = new Response('Departed', CORS_HEADERS);
      return res;
    }
    //Handle CORS request bounces
    const res = new Response('Hello Bun!!!');
    res.headers.set('Access-Control-Allow-Origin', '*');
    res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');

    if(headers.get('jlong-authorization') !== 'PersonalSiteForJordanLong') throw new Error('Unknown Authorization');
    if(method === 'POST'){
      const reqBody = await Bun.readableStreamToJSON(req.body);
      callClaude(reqBody);
    }
    return res;
  }
})

console.log(`listening on port ${PORT}...`);
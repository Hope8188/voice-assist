const https = require('https');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  try {
    const { userInput } = JSON.parse(event.body);
    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
    
    if (!OPENROUTER_API_KEY) {
      return { statusCode: 500, body: 'OPENROUTER_API_KEY not configured' };
    }

    const SYSTEM_PROMPT = 'You are a concise conversational assistant. Only respond to the user\'s exact input. Do not invent facts, add unsolicited information, or break character. Keep responses under 3 short sentences. If uncertain, say \'I\'m not sure about that.\' Do not output markdown, lists, or code.';
    
    const requestBody = JSON.stringify({
      model: 'openai/gpt-4o-mini',
      messages: [{
        role: 'system',
        content: SYSTEM_PROMPT
      }, {
        role: 'user',
        content: userInput
      }],
      max_tokens: 150,
      temperature: 0.2
    });

    const options = {
      hostname: 'openrouter.ai',
      path: '/api/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://voice-assist.netlify.app',
        'X-Title': 'AI Voice Assistant',
        'Content-Length': Buffer.byteLength(requestBody)
      }
    };

    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            const jsonData = JSON.parse(data);
            
            if (res.statusCode !== 200) {
              resolve({
                statusCode: res.statusCode,
                body: JSON.stringify({ error: jsonData.error })
              });
              return;
            }
            
            const response = {
              text: jsonData.choices[0].message.content.trim(),
              model: 'openrouter-gpt-4o-mini'
            };
            
            resolve({
              statusCode: 200,
              body: JSON.stringify(response)
            });
          } catch (error) {
            resolve({
              statusCode: 500,
              body: JSON.stringify({ error: 'Failed to parse response' })
            });
          }
        });
      });

      req.on('error', (error) => {
        resolve({
          statusCode: 500,
          body: JSON.stringify({ error: error.message })
        });
      });

      req.write(requestBody);
      req.end();
    });
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};

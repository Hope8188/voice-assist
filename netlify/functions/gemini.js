const https = require('https');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  try {
    const { userInput, model } = JSON.parse(event.body);
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    
    if (!GEMINI_API_KEY) {
      return { statusCode: 500, body: 'GEMINI_API_KEY not configured' };
    }

    const SYSTEM_PROMPT = 'You are a concise conversational assistant. Only respond to the user\'s exact input. Do not invent facts, add unsolicited information, or break character. Keep responses under 3 short sentences. If uncertain, say \'I\'m not sure about that.\' Do not output markdown, lists, or code.';
    
    const prompt = `${SYSTEM_PROMPT}\n\nUser: ${userInput}`;
    
    const requestBody = JSON.stringify({
      contents: [{
        role: "user",
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 300,
        topP: 0.8
      }
    });

    const options = {
      hostname: 'generativelanguage.googleapis.com',
      path: `/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
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
              text: jsonData.candidates[0].content.parts[0].text.trim(),
              model: model
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

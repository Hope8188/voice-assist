const https = require('https');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  try {
    const { audioData } = JSON.parse(event.body);
    const ASSEMBLYAI_API_KEY = process.env.ASSEMBLYAI_API_KEY;
    
    if (!ASSEMBLYAI_API_KEY) {
      return { statusCode: 500, body: 'ASSEMBLYAI_API_KEY not configured' };
    }

    // Upload audio to AssemblyAI
    const uploadOptions = {
      hostname: 'api.assemblyai.com',
      path: '/v2/upload',
      method: 'POST',
      headers: {
        'Authorization': ASSEMBLYAI_API_KEY,
        'Content-Type': 'application/octet-stream'
      }
    };

    const audioBuffer = Buffer.from(audioData, 'base64');

    return new Promise((resolve, reject) => {
      const uploadReq = https.request(uploadOptions, (uploadRes) => {
        let uploadData = '';
        
        uploadRes.on('data', (chunk) => {
          uploadData += chunk;
        });
        
        uploadRes.on('end', () => {
          try {
            const uploadResponse = JSON.parse(uploadData);
            
            if (uploadRes.statusCode !== 200) {
              resolve({
                statusCode: uploadRes.statusCode,
                body: JSON.stringify({ error: uploadResponse.error })
              });
              return;
            }
            
            const audioUrl = uploadResponse.upload_url;
            
            // Transcribe audio
            const transcribeOptions = {
              hostname: 'api.assemblyai.com',
              path: '/v2/transcript',
              method: 'POST',
              headers: {
                'Authorization': ASSEMBLYAI_API_KEY,
                'Content-Type': 'application/json'
              }
            };
            
            const transcribeBody = JSON.stringify({
              audio_url: audioUrl,
              language_code: 'en_us'
            });
            
            const transcribeReq = https.request(transcribeOptions, (transcribeRes) => {
              let transcribeData = '';
              
              transcribeRes.on('data', (chunk) => {
                transcribeData += chunk;
              });
              
              transcribeRes.on('end', () => {
                try {
                  const transcribeResponse = JSON.parse(transcribeData);
                  
                  if (transcribeRes.statusCode !== 200) {
                    resolve({
                      statusCode: transcribeRes.statusCode,
                      body: JSON.stringify({ error: transcribeResponse.error })
                    });
                    return;
                  }
                  
                  const transcriptId = transcribeResponse.id;
                  
                  // Poll for transcription result
                  const pollTranscript = () => {
                    const pollOptions = {
                      hostname: 'api.assemblyai.com',
                      path: `/v2/transcript/${transcriptId}`,
                      method: 'GET',
                      headers: {
                        'Authorization': ASSEMBLYAI_API_KEY
                      }
                    };
                    
                    const pollReq = https.request(pollOptions, (pollRes) => {
                      let pollData = '';
                      
                      pollRes.on('data', (chunk) => {
                        pollData += chunk;
                      });
                      
                      pollRes.on('end', () => {
                        try {
                          const pollResponse = JSON.parse(pollData);
                          
                          if (pollResponse.status === 'completed') {
                            resolve({
                              statusCode: 200,
                              body: JSON.stringify({ transcript: pollResponse.text })
                            });
                          } else if (pollResponse.status === 'error') {
                            resolve({
                              statusCode: 500,
                              body: JSON.stringify({ error: pollResponse.error })
                            });
                          } else {
                            // Still processing, poll again
                            setTimeout(pollTranscript, 500);
                          }
                        } catch (error) {
                          resolve({
                            statusCode: 500,
                            body: JSON.stringify({ error: 'Failed to parse poll response' })
                          });
                        }
                      });
                    });
                    
                    pollReq.on('error', () => {
                      resolve({
                        statusCode: 500,
                        body: JSON.stringify({ error: 'Poll request failed' })
                      });
                    });
                    
                    pollReq.end();
                  };
                  
                  pollTranscript();
                  
                } catch (error) {
                  resolve({
                    statusCode: 500,
                    body: JSON.stringify({ error: 'Failed to parse transcribe response' })
                  });
                }
              });
            });
            
            transcribeReq.on('error', () => {
              resolve({
                statusCode: 500,
                body: JSON.stringify({ error: 'Transcribe request failed' })
              });
            });
            
            transcribeReq.write(transcribeBody);
            transcribeReq.end();
            
          } catch (error) {
            resolve({
              statusCode: 500,
              body: JSON.stringify({ error: 'Failed to parse upload response' })
            });
          }
        });
      });
      
      uploadReq.on('error', () => {
        resolve({
          statusCode: 500,
          body: JSON.stringify({ error: 'Upload request failed' })
        });
      });
      
      uploadReq.write(audioBuffer);
      uploadReq.end();
    });
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};

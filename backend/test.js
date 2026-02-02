import https from 'https';

const options = {
  method: 'GET',
  hostname: 'cricket-api-free-data.p.rapidapi.com',
  path: '/cricket-livescores',
  headers: {
    'x-rapidapi-key': 'b02bb5e0a2mshab887cd6e7331d0p131a31jsn6c7c82c7e0d2',
    'x-rapidapi-host': 'cricket-api-free-data.p.rapidapi.com'
  }
};

function fetchLiveScores() {
  const req = https.request(options, res => {
    let data = '';

    res.on('data', chunk => (data += chunk));

    res.on('end', () => {
      try {
        const json = JSON.parse(data);
        console.clear();
        console.log('🏏 Live Scores (Updated every second):\n');
        console.log(JSON.stringify(json, null, 2));
      } catch (err) {
        console.error('⚠️ Error parsing JSON:', err.message);
        console.log('Raw response:', data);
      }
    });
  });

  req.on('error', err => console.error('❌ Request error:', err.message));
  req.end();
}

// Run immediately once
fetchLiveScores();

// Poll every 1 second (1000 ms)
setInterval(fetchLiveScores, 1000);

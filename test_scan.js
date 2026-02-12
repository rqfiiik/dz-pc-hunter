const http = require('http');

const data = JSON.stringify({
    model: 'iphone 13'
});

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/scan',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = http.request(options, (res) => {
    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
        try {
            const json = JSON.parse(body);
            console.log('Status:', res.statusCode);
            console.log('Model:', json.model);
            console.log('Deals Found:', json.deals ? json.deals.length : 0);
            if (json.deals) {
                const sources = [...new Set(json.deals.map(d => d.source))];
                console.log('Sources:', sources);
                console.log('First 3 deals:');
                console.log(json.deals.slice(0, 3));
            } else {
                console.log('Response:', json);
            }
        } catch (e) {
            console.log('Error parsing JSON:', e);
            console.log('Raw Body:', body);
        }
    });
});

req.on('error', (error) => {
    console.error('Request failed:', error);
});

req.write(data);
req.end();

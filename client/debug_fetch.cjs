const axios = require('axios');
const fs = require('fs');

const url = 'https://www.ouedkniss.com/s/macbook';
const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
};

axios.get(url, { headers })
    .then(response => {
        fs.writeFileSync('ouedkniss_debug.html', response.data);
        console.log('Successfully fetched page. Status:', response.status);
    })
    .catch(error => {
        console.error('Error fetching page:', error.message);
        if (error.response) {
            console.log('Status:', error.response.status);
            fs.writeFileSync('ouedkniss_error.html', error.response.data);
        }
    });

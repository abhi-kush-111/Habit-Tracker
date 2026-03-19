import https from 'https';

https.get('https://superprofile.bio/vp/699de3f3fef2d00013f19672', (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    const imgRegex = /<img[^>]+src="([^">]+)"/g;
    let match;
    while ((match = imgRegex.exec(data)) !== null) {
      console.log(match[1]);
    }
    
    const metaRegex = /<meta[^>]+content="([^">]+)"/g;
    while ((match = metaRegex.exec(data)) !== null) {
        if(match[1].includes('http') && (match[1].includes('.jpg') || match[1].includes('.png') || match[1].includes('.webp'))) {
            console.log('META:', match[1]);
        }
    }
  });
});

import https from 'https';

https.get('https://media-cdn.cosmofeed.com/profile/my_image1769145362-2026-23-01-05-12-26.png', (res) => {
  console.log(res.statusCode);
});

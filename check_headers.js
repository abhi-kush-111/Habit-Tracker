import https from 'https';
https.get('https://superprofile.bio/vp/699de3f3fef2d00013f19672?checkout=true', (res) => {
  console.log(res.headers);
});

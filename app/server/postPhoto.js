const axios = require('axios')
// eslint-disable-next-line require-await
exports.handler = async (event) => {
  // eslint-disable-next-line no-console
  console.log('Request headers ', event.headers)
  const params = JSON.parse(event.body).params
  const accessToken = params.accessToken
  const photoURL = params.photoURL
  if (!accessToken || !photoURL)
    return { statusCode: 400, body: 'There are invalid parameters.' }
  // Buffer
  const fileData = photoURL.replace(/^data:\w+\/\w+;base64,/, '')
  const fileBuffer = Buffer.from(fileData, 'base64')
  // ContentType(image/png)
  const contentType = photoURL
    .toString()
    .slice(photoURL.indexOf(':') + 1, photoURL.indexOf(';'))
  // Google upload
  const url = 'https://photoslibrary.googleapis.com/v1/uploads'
  const headers = {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-type': 'application/octet-stream',
      'X-Goog-Upload-Content-Type': contentType,
      'X-Goog-Upload-Protocol': 'raw'
    }
  }

  // response
  const res = await axios.post(url, fileBuffer, headers).catch((e) => e)
  if (res.statusText === 'OK')
    return {
      statusCode: 200,
      body: res.data
    }
  else
    return {
      statusCode: 500,
      body: JSON.stringify(res)
    }
}

import axios from 'axios'
import pinata from './pinata.json';

exports.handler = async (event) => {
  const BASE_URL = 'https://api.pinata.cloud/pinning/pinFileToIPFS'
  const object = event.body

  try {
    const { status, data } = await axios.post(BASE_URL, object, {
      headers: {
        'Content-Type': event.headers['Content-Type'] || event.headers['content-type'],
        maxBodyLength: 'Infinity',
        pinata_api_key: pinata.PINATA_API_KEY,
        pinata_secret_api_key: pinata.PINATA_SECRET_API_KEY,
      },
    })
    console.log('[PINATA] Pin FILE', status, data)

    return {
      statusCode: status,
      body: JSON.stringify(data),
    }


  } catch (e) {
    console.log('Error', e.message, e.data)
    return {
      statusCode: 500,
      body: e.message,
    }
  }

}


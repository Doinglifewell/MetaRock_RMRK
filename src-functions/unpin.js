import axios from 'axios'
import pinata from './pinata.json';

exports.handler = async (event) => {


  const hash = event.queryStringParameters.hash

  if (!hash) {
    return {
      statusCode: 403,
      body: 'Cannot unpin without hash',
    }
  }

  const BASE_URL = `https://api.pinata.cloud/pinning/unpin/${hash}`

  try {
    const { status, data } = await axios.delete(BASE_URL, {
      headers: {
        'Content-Type': 'application/json',
        pinata_api_key: pinata.PINATA_API_KEY,
        pinata_secret_api_key: pinata.PINATA_SECRET_API_KEY
      },
    })
    console.log('[PINATA] Pin HASH', status, data)

    return {
      statusCode: status,
      body: JSON.stringify(data),
    }


  } catch (e) {
    console.log('Error', e.message)
    return {
      statusCode: 500,
      body: e.message,
    }
  }

}


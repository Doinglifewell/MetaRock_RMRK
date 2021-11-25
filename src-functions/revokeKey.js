import axios from 'axios'
import pinata from './pinata.json';

exports.handler = async (event) => {
  const BASE_URL = 'https://api.pinata.cloud/users/revokeApiKey'
  const key = event.queryStringParameters.key

  if (!key) {
    return {
      statusCode: 403,
      body: 'Cannot revoke without key',
    }
  }

  const object = {
    apiKey: key,
  }

  try {
    const { status, data } = await axios.put(BASE_URL, object, {
      headers: {
        'Content-Type': 'application/json',
        pinata_api_key: pinata.PINATA_API_KEY,
        pinata_secret_api_key: pinata.PINATA_SECRET_API_KEY,
      },
    })
    console.log('[PINATA] Revoke Key', status, data)

    if (status < 400) {
      return {
        statusCode: status,
        body: JSON.stringify(data),
      }
    }


  } catch (e) {
    console.log('Error', e.message)
    return {
      statusCode: 500,
      body: e.message,
    }
  }

  return {
    statusCode: status,
    body: JSON.stringify({}),
  }
}


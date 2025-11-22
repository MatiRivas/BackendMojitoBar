const redis = require('redis');

/**
 * Cliente compartido de Redis
 * Infraestructura compartida para eventos/caché
 */
let redisClient = null;

async function createRedisClient() {
  if (!process.env.REDIS_URL) {
    console.warn('REDIS_URL no configurado, Redis no estará disponible');
    return null;
  }

  try {
    const client = redis.createClient({
      url: process.env.REDIS_URL,
    });

    client.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });

    await client.connect();
    console.log('Redis conectado exitosamente');
    return client;
  } catch (error) {
    console.error('Error conectando a Redis:', error);
    return null;
  }
}

async function getRedisClient() {
  if (!redisClient) {
    redisClient = await createRedisClient();
  }
  return redisClient;
}

module.exports = { getRedisClient };

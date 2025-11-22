const EventPublisher = require('../../domain/ports/EventPublisher');

/**
 * Adaptador de eventos para Redis
 * Implementa el puerto EventPublisher
 */
class RedisEventPublisher extends EventPublisher {
  constructor(redisClient) {
    super();
    this.client = redisClient;
  }

  async publish(channel, event) {
    if (!this.client || !this.client.isOpen) {
      console.warn('Redis no está disponible, evento no publicado:', channel);
      return;
    }

    try {
      await this.client.publish(channel, JSON.stringify(event));
    } catch (error) {
      console.error('Error publicando evento:', error);
    }
  }
}

module.exports = RedisEventPublisher;

/**
 * Puerto (Interface) para publicación de eventos
 * Define el contrato para adaptadores de mensajería/eventos
 */
class EventPublisher {
  async publish(channel, event) {
    throw new Error('Method not implemented');
  }
}

module.exports = EventPublisher;

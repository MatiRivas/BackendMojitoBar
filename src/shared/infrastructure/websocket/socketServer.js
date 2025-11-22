/**
 * Servidor WebSocket compartido
 * Adaptador de salida para comunicación en tiempo real
 */
function setupWebSocketServer(io, eventPublisher) {
  io.on('connection', (socket) => {
    console.log(`Cliente WebSocket conectado: ${socket.id}`);

    socket.on('disconnect', () => {
      console.log(`Cliente WebSocket desconectado: ${socket.id}`);
    });
  });

  // Suscribirse a eventos de Redis si está disponible
  if (eventPublisher && eventPublisher.client && eventPublisher.client.isOpen) {
    const subscriber = eventPublisher.client.duplicate();
    
    subscriber.connect().then(() => {
      subscriber.subscribe('inventario_actualizado', (message) => {
        const evento = JSON.parse(message);
        io.emit('inventarioActualizado', evento);
      });
    }).catch(err => {
      console.error('Error suscribiendo a eventos Redis:', err);
    });
  }

  return io;
}

module.exports = setupWebSocketServer;

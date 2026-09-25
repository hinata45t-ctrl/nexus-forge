export class ConnectionManager {
  constructor({ manager, logger }) {
    this.manager = manager;
    this.logger = logger;
  }

  async ensureConnected(instanceId) {
    const socket = this.manager.getSocket(instanceId);
    if (socket) return socket;
    return this.manager.connect(instanceId);
  }
}

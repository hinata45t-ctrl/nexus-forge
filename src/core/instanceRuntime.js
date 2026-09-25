export class InstanceRuntime {
  constructor() { this.statuses = new Map(); }
  set(id, status) { this.statuses.set(id, status); }
  get(id) { return this.statuses.get(id); }
  delete(id) { this.statuses.delete(id); }
}

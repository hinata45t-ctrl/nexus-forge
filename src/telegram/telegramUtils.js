import crypto from 'node:crypto';
import { InstanceStore } from './instanceStore.js';
import { InstanceConfig } from './instanceConfig.js';
import { InstanceRuntime } from './instanceRuntime.js';
import { createLogger } from './logger.js';
import { WhatsAppManager } from '../whatsapp/whatsappManager.js';
import { CommandManager } from '../commands/commandManager.js';
import { registerBuiltins } from '../commands/builtins/index.js';

export function createNexusForge(options = {}) {
  const logger = options.logger ?? createLogger();
  const store = options.store ?? new InstanceStore(options.storageRoot);
  const config = new InstanceConfig(store);
  const runtime = new InstanceRuntime();
  const whatsapp = options.whatsapp ?? new WhatsAppManager({ store, runtime, logger });
  const commands = new CommandManager({ logger });
  registerBuiltins(commands);
  whatsapp.setCommandManager(commands);

  const createInstance = async (input) => {
    const instanceId = input.instanceId ?? `nf_${crypto.randomUUID()}`;
    const normalized = config.validateConfig({ ...input, instanceId });
    await store.create(instanceId, normalized);
    runtime.set(instanceId, 'created');
    logger.info({ instanceId }, 'Instance created');
    return { instanceId, status: 'created' };
  };

  const getInstance = (id) => store.get(id);
  const listInstances = () => store.list();
  const updateInstance = async (id, updates) => store.update(id, config.validateConfig({ ...(await store.get(id)), ...updates, instanceId: id }));
  const deleteInstance = async (id) => {
    await whatsapp.disconnect(id);
    runtime.delete(id);
    return store.delete(id);
  };
  const startInstance = (id) => whatsapp.connect(id);
  const stopInstance = (id) => whatsapp.disconnect(id);
  const restartInstance = (id) => whatsapp.restart(id);
  const getInstanceStatus = (id) => runtime.get(id) ?? 'created';
  const getInstanceConfig = (id) => config.getConfig(id);
  const setMenuImage = (id, imagePath) => config.setMenuImage(id, imagePath);
  const api = { createInstance, getInstance, listInstances, updateInstance, deleteInstance, startInstance, stopInstance, restartInstance, getInstanceStatus, getInstanceConfig, setMenuImage, config, store, whatsapp, commands, logger };

  return {
    ...api,
    createBot: createInstance,
    getBot: getInstance,
    listBots: listInstances,
    updateBot: updateInstance,
    startBot: startInstance,
    stopBot: stopInstance,
    restartBot: restartInstance,
    deleteBot: deleteInstance,
    getBotStatus: getInstanceStatus,
    pairBot: (id, phone) => whatsapp.requestPairingCode(id, phone),
    restoreInstances: () => whatsapp.restoreInstances(),
  };
}

export { InstanceStore } from './instanceStore.js';
export { InstanceConfig } from './instanceConfig.js';
export { InstanceRuntime } from './instanceRuntime.js';

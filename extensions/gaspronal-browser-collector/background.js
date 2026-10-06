const DEFAULT_SERVER_URL = "wss://gaspronal.programandoweb.net/browser";
const HEARTBEAT_MS = 20000;

let socket = null;
let reconnectTimer = null;
let heartbeatTimer = null;
let running = false;

let state = {
  connected: false,
  running: false,
  collected: 0,
  serverUrl: DEFAULT_SERVER_URL,
  error: null,
  phase: "Desconectado",
};

const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const publish = (patch) => {
  state = { ...state, ...patch };
  chrome.runtime.sendMessage({ type: "GASPRONAL_COLLECTOR_STATE", state }).catch(() => undefined);
};

const send = (event, data = {}) => {
  if (socket?.readyState !== WebSocket.OPEN) return false;
  socket.send(JSON.stringify({ event, data }));
  return true;
};

function stopHeartbeat() {
  if (heartbeatTimer) clearInterval(heartbeatTimer);
  heartbeatTimer = null;
}

function startHeartbeat() {
  stopHeartbeat();
  heartbeatTimer = setInterval(() => {
    send("browser:ping", { at: Date.now() });
  }, HEARTBEAT_MS);
}

async function currentServerUrl() {
  const config = await chrome.storage.local.get(["serverUrl"]);
  const url = new URL(String(config.serverUrl || DEFAULT_SERVER_URL).trim());
  if (!["ws:", "wss:"].includes(url.protocol)) throw new Error("La URL debe usar ws:// o wss://");
  return url.toString().replace(/\/$/, "");
}

async function connect() {
  clearTimeout(reconnectTimer);
  stopHeartbeat();

  let serverUrl;
  try {
    serverUrl = await currentServerUrl();
  } catch (error) {
    publish({ connected: false, error: String(error), phase: "Configuración inválida" });
    return;
  }

  socket?.close();
  publish({ serverUrl, connected: false, error: null, phase: "Conectando" });

  const current = new WebSocket(serverUrl);
  socket = current;

  current.addEventListener("open", () => {
    if (socket !== current) return;
    publish({ connected: true, error: null, phase: "Preparado para recolectar" });
    send("browser:hello", { name: "Gaspronal Browser Collector", version: "1.0.1" });
    send("browser:ping", { at: Date.now() });
    startHeartbeat();
  });

  current.addEventListener("message", (event) => {
    if (socket !== current) return;

    let message;
    try {
      message = JSON.parse(String(event.data));
    } catch {
      return;
    }

    if (message?.event === "browser:ready" || message?.event === "browser:pong") {
      publish({ connected: true, error: null, phase: running ? state.phase : "Preparado para recolectar" });
      return;
    }

    if (message?.event === "browser:ping") {
      send("browser:pong", { at: Date.now() });
      return;
    }

    if (message?.event === "browser:task") void executeTask(message.data || {});
  });

  current.addEventListener("close", () => {
    if (socket !== current) return;
    stopHeartbeat();
    publish({ connected: false, running: false, phase: "Desconectado" });
    reconnectTimer = setTimeout(() => void connect(), 3000);
  });

  current.addEventListener("error", () => {
    publish({ error: "No fue posible conectar con Gaspronal.", phase: "Error WebSocket" });
  });
}

async function executeTask(task) {
  if (running) return;

  const taskId = String(task?.taskId || "");
  const url = String(task?.url || "");
  if (task?.type !== "SCRAPE_URL" || !taskId || !/^https?:\/\//i.test(url)) return;

  running = true;
  publish({ running: true, collected: 0, error: null, phase: "Recolectando " + url });

  let tabId = null;
  let temporaryWindowId = null;

  try {
    const { tab, windowId } = await createCollectorTab(url);
    tabId = tab.id;
    temporaryWindowId = windowId;
    if (!tabId) throw new Error("No fue posible crear la pestaña.");

    await waitForTab(tabId);
    await pause(1200);

    const response = await chrome.tabs.sendMessage(tabId, { type: "GASPRONAL_SCRAPE_PAGE" });
    if (!response?.result) throw new Error("La página no devolvió contenido.");

    publish({ collected: String(response.result.text || "").length });
    send("browser:result", { taskId, status: "success", result: response.result });
  } catch (error) {
    send("browser:result", {
      taskId,
      status: "error",
      error: error instanceof Error ? error.message : String(error),
    });
    publish({ error: error instanceof Error ? error.message : String(error) });
  } finally {
    if (tabId) await chrome.tabs.remove(tabId).catch(() => undefined);
    if (temporaryWindowId) await chrome.windows.remove(temporaryWindowId).catch(() => undefined);
    running = false;
    publish({ running: false, phase: "Preparado para recolectar" });
  }
}

async function createCollectorTab(url) {
  const windows = await chrome.windows.getAll({ windowTypes: ["normal"] }).catch(() => []);
  const targetWindow = windows.find((item) => item.focused) || windows[0];

  if (targetWindow?.id) {
    const tab = await chrome.tabs.create({
      windowId: targetWindow.id,
      url,
      active: false,
    });

    return { tab, windowId: null };
  }

  const createdWindow = await chrome.windows.create({
    url,
    focused: false,
    type: "normal",
  });

  const tab = createdWindow.tabs?.[0];
  if (!tab?.id || !createdWindow.id) {
    if (createdWindow.id) await chrome.windows.remove(createdWindow.id).catch(() => undefined);
    throw new Error("No fue posible crear una ventana para recolectar la fuente.");
  }

  return { tab, windowId: createdWindow.id };
}

function waitForTab(tabId) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      chrome.tabs.onUpdated.removeListener(listener);
      reject(new Error("Timeout cargando la fuente."));
    }, 30000);

    const listener = (id, info) => {
      if (id !== tabId || info.status !== "complete") return;
      clearTimeout(timer);
      chrome.tabs.onUpdated.removeListener(listener);
      resolve();
    };

    chrome.tabs.onUpdated.addListener(listener);
  });
}

chrome.runtime.onMessage.addListener((message, _sender, respond) => {
  if (message?.type === "GASPRONAL_COLLECTOR_GET_STATE") {
    respond(state);
    return;
  }

  if (message?.type === "GASPRONAL_COLLECTOR_CONFIGURE") {
    chrome.storage.local.set(
      { serverUrl: String(message.serverUrl || DEFAULT_SERVER_URL) },
      () => void connect().then(() => respond(state)),
    );
    return true;
  }
});

chrome.runtime.onInstalled.addListener(() =>
  void chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }),
);

void chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
void connect();

import { HttpAdapterHost } from "@nestjs/core";
import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import type { IncomingMessage } from "node:http";
import { WebSocket, WebSocketServer } from "ws";

type PendingTask = {
  resolve: (value: Record<string, unknown>) => void;
  reject: (error: Error) => void;
  timer: NodeJS.Timeout;
};

@Injectable()
export class BrowserBridgeService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(BrowserBridgeService.name);
  private readonly clients = new Set<WebSocket>();
  private readonly heartbeats = new Map<WebSocket, NodeJS.Timeout>();
  private readonly lastSeen = new Map<WebSocket, number>();
  private readonly pending = new Map<string, PendingTask>();
  private wss?: WebSocketServer;
  private upgradeHandler?: (request: IncomingMessage, socket: any, head: Buffer) => void;

  constructor(private readonly adapterHost: HttpAdapterHost) {}

  onModuleInit(): void {
    const path = process.env.BROWSER_SOCKET_PATH?.trim() || "/browser";
    const httpServer = this.adapterHost.httpAdapter.getHttpServer();

    this.wss = new WebSocketServer({ noServer: true });
    this.upgradeHandler = (request, socket, head) => {
      let pathname = "";
      try {
        pathname = new URL(request.url || "/", "http://localhost").pathname;
      } catch {
        return;
      }

      if (pathname !== path) return;
      this.wss?.handleUpgrade(request, socket, head, (client) => this.attach(client));
    };

    httpServer.on("upgrade", this.upgradeHandler);
    this.logger.log(`Browser Agent WebSocket disponible en ${path} (sin autenticación temporal).`);
  }

  onModuleDestroy(): void {
    const httpServer = this.adapterHost.httpAdapter.getHttpServer();
    if (this.upgradeHandler) httpServer.off("upgrade", this.upgradeHandler);

    for (const timer of this.heartbeats.values()) clearInterval(timer);
    this.heartbeats.clear();

    this.wss?.close();

    for (const task of this.pending.values()) {
      clearTimeout(task.timer);
      task.reject(new Error("Browser bridge detenido."));
    }
    this.pending.clear();
  }

  hasCollector(): boolean {
    return [...this.clients].some((client) => client.readyState === WebSocket.OPEN);
  }

  async scrape(url: string): Promise<Record<string, unknown>> {
    const client = [...this.clients]
      .filter((item) => item.readyState === WebSocket.OPEN)
      .sort((a, b) => (this.lastSeen.get(b) ?? 0) - (this.lastSeen.get(a) ?? 0))[0];
    if (!client) throw new Error("La extensión Gaspronal Browser Collector no está conectada.");

    const taskId = randomUUID();
    const timeoutMs = Math.max(10000, Number(process.env.BROWSER_TASK_TIMEOUT_MS || 90000));

    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(taskId);
        reject(new Error(`Timeout recolectando ${url}`));
      }, timeoutMs);

      this.pending.set(taskId, { resolve, reject, timer });
      client.send(JSON.stringify({ event: "browser:task", data: { taskId, type: "SCRAPE_URL", url } }));
    });
  }

  private attach(client: WebSocket): void {
    this.clients.add(client);
    this.lastSeen.set(client, Date.now());
    client.send(JSON.stringify({ event: "browser:ready", data: { collector: "gaspronal" } }));

    const heartbeat = setInterval(() => {
      if (client.readyState !== WebSocket.OPEN) return;
      client.send(JSON.stringify({ event: "browser:ping", data: { at: Date.now() } }));
    }, 20000);
    this.heartbeats.set(client, heartbeat);

    client.on("message", (raw) => {
      let envelope: any;
      try {
        envelope = JSON.parse(String(raw));
      } catch {
        return;
      }

      this.lastSeen.set(client, Date.now());

      if (envelope?.event === "browser:hello") {
        this.logger.log(`Recolector conectado: ${String(envelope?.data?.name || "Chrome")}`);
        return;
      }

      if (envelope?.event === "browser:task-accepted") {
        this.logger.log(`Recolector aceptó tarea ${String(envelope?.data?.taskId || "")}: ${String(envelope?.data?.url || "")}`);
        return;
      }

      if (envelope?.event === "browser:ping") {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ event: "browser:pong", data: { at: Date.now() } }));
        }
        return;
      }

      if (envelope?.event === "browser:pong") return;
      if (envelope?.event !== "browser:result") return;

      const taskId = String(envelope?.data?.taskId || "");
      const pending = this.pending.get(taskId);
      if (!pending) return;

      clearTimeout(pending.timer);
      this.pending.delete(taskId);

      envelope?.data?.status === "success"
        ? pending.resolve((envelope.data.result || {}) as Record<string, unknown>)
        : pending.reject(new Error(String(envelope?.data?.error || "El recolector devolvió un error.")));
    });

    const cleanup = () => {
      this.clients.delete(client);
      this.lastSeen.delete(client);
      const timer = this.heartbeats.get(client);
      if (timer) clearInterval(timer);
      this.heartbeats.delete(client);
    };

    client.on("close", cleanup);
    client.on("error", (error) => this.logger.warn(`Browser collector: ${error.message}`));
  }
}

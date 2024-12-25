import { Socket, io } from "socket.io-client";

interface SocketConfig {
    serverUrl: string;
    userAgent: string;
    connectionTimeout: number;
}

interface SocketConnectionOptions {
    forceNew: boolean;
    transports: string[];
    upgrade: boolean;
    path: string;
    extraHeaders: {
        "user-agent": string;
        authorization?: string;
    };
}

export class SocketHandler {
    private static instance: SocketHandler;
    private socket: Socket | null = null;
    private namespace: string = "";
    private serverUrl: string = "http://localhost:5000";
    private config: SocketConfig;
    private static readonly DEFAULT_CONFIG: SocketConfig = {
        serverUrl: "http://localhost:5000",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        connectionTimeout: 5000,
    };

    private constructor(private socketConfig: SocketConfig) {
        this.config = socketConfig;
        this.serverUrl = socketConfig.serverUrl;
    }

    static getInstance(config?: SocketConfig): SocketHandler {
        if (!this.instance) {
            this.instance = new SocketHandler(config ?? this.DEFAULT_CONFIG);
        }
        return this.instance;
    }

    async connect(namespace: string, token?: string): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                const socketOptions: SocketConnectionOptions = {
                    forceNew: true,
                    transports: ["websocket"],
                    upgrade: false,
                    path: `/${namespace}/socket.io`,
                    extraHeaders: {
                        "user-agent": this.config.userAgent,
                        ...(token && { authorization: `Bearer ${token}` }),
                    },
                };

                const uri = `${this.serverUrl}/user/${namespace}`;
                this.socket = io(uri, socketOptions);

                this.socket.on("connect", () => {
                    this.namespace = namespace;
                    resolve();
                });

                this.socket.on("connect_error", (error) => {
                    reject(error);
                });

                setTimeout(() => {
                    if (!this.isConnected()) {
                        reject(new Error("Connection timeout"));
                    }
                }, this.config.connectionTimeout);
            } catch (error) {
                reject(error);
            }
        });
    }

    isConnected(): boolean {
        return !!this.socket?.connected;
    }

    getNamespace(): string {
        return this.namespace;
    }

    onEvent(callback: (event: string, data: object) => void): void {
        if (!this.socket) return;

        // Add your event listeners here
        const events = ["game_state", "player_joined", "error"];
        events.forEach((event) => {
            this.socket?.on(event, (data) => callback(event, data));
        });
    }

    emit(event: string, data: object): void {
        if (!this.socket) return;
        this.socket.emit(event, data);
    }

    cleanup(): void {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.namespace = "";
        }
    }
}

export const socketHandler = SocketHandler.getInstance();

import { emitSocketEvent } from "@/utils/socket";

export interface AuthCredentials {
    token?: string;
    userId?: string;
}

export class AuthHandler {
    private static instance: AuthHandler;
    private credentials: AuthCredentials = {};

    private constructor() {}

    static getInstance(): AuthHandler {
        if (!this.instance) {
            this.instance = new AuthHandler();
        }
        return this.instance;
    }

    setCredentials(credentials: AuthCredentials) {
        this.credentials = credentials;
    }

    getCredentials(): AuthCredentials {
        return this.credentials;
    }

    async signIn(userId: string): Promise<void> {
        try {
            await emitSocketEvent("sign_in", { userId });
            this.setCredentials({ userId });
        } catch (error) {
            throw new Error(`Sign in failed: ${error}`);
        }
    }

    isAuthenticated(): boolean {
        return !!this.credentials.userId;
    }
}

export const authHandler = AuthHandler.getInstance();

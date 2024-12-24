import { AuthHandler } from "../auth.handler";
import { emitSocketEvent } from "@/utils/socket";

// Mock only what this test needs
jest.mock("@/utils/socket", () => ({
    emitSocketEvent: jest.fn(),
}));

describe("AuthHandler", () => {
    let authHandler: AuthHandler;

    beforeEach(() => {
        authHandler = AuthHandler.getInstance();
        // Clear mock between tests
        jest.clearAllMocks();
    });

    it("should maintain singleton instance", () => {
        const instance1 = AuthHandler.getInstance();
        const instance2 = AuthHandler.getInstance();
        expect(instance1).toBe(instance2);
    });

    it("should handle credentials", () => {
        const credentials = { userId: "test-user" };
        authHandler.setCredentials(credentials);
        expect(authHandler.getCredentials()).toEqual(credentials);
    });

    it("should check authentication status", () => {
        authHandler.setCredentials({});
        expect(authHandler.isAuthenticated()).toBeFalsy();

        authHandler.setCredentials({ userId: "test-user" });
        expect(authHandler.isAuthenticated()).toBeTruthy();
    });

    it("should handle sign in", async () => {
        const userId = "test-user";
        await authHandler.signIn(userId);
        expect(emitSocketEvent).toHaveBeenCalledWith("sign_in", { userId });
        expect(authHandler.isAuthenticated()).toBeTruthy();
    });
});

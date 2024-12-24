import { io } from "socket.io-client";

const socket = io("http://localhost:YOUR_SERVER_PORT");

export const socketActions = {
    SIGN_IN: "signIn",
    PLACE_BET: "placeBet",
    CASH_OUT: "cashOut",
    IN_GAME: "inGame",
} as const;

export const emitSocketEvent = (action: string, payload: any) => {
    socket.emit(action, payload);
};

export const initializeSocket = (onMessage: (event: string, data: any) => void) => {
    // Listen for all possible server events
    socket.onAny((event, data) => {
        onMessage(event, data);
    });

    return socket;
};

export default socket;

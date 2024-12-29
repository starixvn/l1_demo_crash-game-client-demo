"use client";
import { useState, useEffect } from "react";
import { socketHandler } from "@/handlers/socket.handler";
import { authHandler } from "@/handlers/auth.handler";
import { ConnectionPanel } from "@/components/ConnectionPanel";
import { MessageConsole } from "@/components/MessageConsole";
import { MessageInput } from "@/components/MessageInput";

export const SplashPage = () => {
    const [namespace, setNamespace] = useState("");
    const [error, setError] = useState("");
    const [isConnecting, setIsConnecting] = useState(false);
    const [userAgent, setUserAgent] = useState("axios/0.27.2");
    const [messages, setMessages] = useState<string[]>([]);
    const [jsonInput, setJsonInput] = useState("");
    const [messageNamespace, setMessageNamespace] = useState("");
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        setUserAgent(window.navigator.userAgent);
        return () => {
            socketHandler.removeMessageListener();
        };
    }, []);

    const handleConnect = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsConnecting(true);
        setError("");

        try {
            const token = await authHandler.getSSOToken(userAgent);
            const authorizeInfo = await authHandler.authorize(token, userAgent);
            await socketHandler.connect(namespace);
            const socketNamespace = "CoinTap";

            socketHandler.onMessage((event: string, message: object) => {
                setMessages((prev) => [`[${event}] - ${JSON.stringify(message)}`, ...prev]);
            });

            await socketHandler.requestSignIn(authorizeInfo);
            await socketHandler.requestInGame({ name: socketNamespace });
            setIsConnected(true);
        } catch (err) {
            setError(`Connection failed: ${err}`);
        } finally {
            setIsConnecting(false);
        }
    };

    const handleSubmitMessage = () => {
        try {
            const jsonString = jsonInput.replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":').replace(/'/g, '"');
            const jsonData = JSON.parse(jsonString);
            socketHandler.emit(messageNamespace || "message", jsonData);
        } catch (err: unknown) {
            setError(`Invalid format: ${err}`);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center bg-gray-900 p-8">
            <div className="w-full max-w-4xl space-y-8">
                {/* ... header JSX ... */}

                {!isConnected ? (
                    <ConnectionPanel
                        namespace={namespace}
                        setNamespace={setNamespace}
                        error={error}
                        isConnecting={isConnecting}
                        onConnect={handleConnect}
                    />
                ) : (
                    <div className="space-y-8">
                        <MessageConsole messages={messages} />
                        <MessageInput
                            messageNamespace={messageNamespace}
                            setMessageNamespace={setMessageNamespace}
                            jsonInput={jsonInput}
                            setJsonInput={setJsonInput}
                            onSubmit={handleSubmitMessage}
                            isConnected={socketHandler.isConnected()}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default SplashPage;

"use client";
import { useState, useEffect } from "react";
import { socketHandler } from "@/handlers/socket.handler";

interface AuthResponse {
    token: string;
    refreshToken: string;
}

export default function SplashPage() {
    const [namespace, setNamespace] = useState("");
    const [error, setError] = useState("");
    const [isConnecting, setIsConnecting] = useState(false);
    const [userAgent, setUserAgent] = useState("axios/0.27.2");
    const [messages, setMessages] = useState<string[]>([]);
    const [jsonInput, setJsonInput] = useState("");

    useEffect(() => {
        setUserAgent(window.navigator.userAgent);

        // Set up socket message listener
        socketHandler.onMessage((message: object) => {
            setMessages((prev) => [...prev, JSON.stringify(message)]);
        });

        return () => {
            socketHandler.removeMessageListener();
        };
    }, []);

    const SystemInfo = {
        SC1: {
            auth: {
                operatorId: "ONEworks1",
                operatorSecret: "ONEworks1@20luminet&",
            },
            currency: "$US",
        },
        VG2: {
            auth: {
                operatorId: "ONEworksVGCash",
                operatorSecret: "VG@SC123",
            },
            currency: "INH",
        },
    };

    const getSSOToken = async (): Promise<string> => {
        try {
            const systemInfo = SystemInfo["SC1"];
            const requestBody = {
                playerId: "21031988",
                playerName: "test21031988",
                language: "vi-VN",
                currency: systemInfo.currency,
                seq: "d,y,lumi",
                siteId: "4100300",
                siteName: "lumi",
                ip: "",
                browserUserAgent: userAgent,
                auth: systemInfo.auth,
                gameId: 0,
                domain: "example.com",
                appType: 1,
            };
            const response = await fetch(`${process.env.NEXT_PUBLIC_SIMULATOR_URL}/signin/sso`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),
            });

            console.log("simulator url: ", process.env.NEXT_PUBLIC_SIMULATOR_URL);

            if (!response.ok) {
                throw new Error("Failed to get SSO token");
            }

            const data: AuthResponse = await response.json();
            return data.token;
        } catch (error) {
            throw new Error(`SSO token error: ${error}`);
        }
    };

    const authorize = async (token: string): Promise<object> => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_USER_SERVICE_URL}/auth/sso?token=${token}&system=1`, {
                method: "GET",
                headers: {
                    "user-agent": userAgent,
                },
            });

            if (!response.ok) {
                throw new Error("Authorization failed");
            }

            const data = await response.json();
            return data;
        } catch (error) {
            throw new Error(`Authorization error: ${error}`);
        }
    };

    const handleConnect = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsConnecting(true);
        setError("");

        try {
            const token = await getSSOToken();

            const authorizeInfo = await authorize(token);

            await socketHandler.connect(namespace);
            await socketHandler.requestSignIn(authorizeInfo);
            await socketHandler.requestInGame({ name: namespace });
        } catch (err) {
            setError(`Connection failed: ${err}`);
        } finally {
            setIsConnecting(false);
        }
    };

    const handleSubmitMessage = () => {
        try {
            // Convert object-like string to valid JSON
            const jsonString = jsonInput
                .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":') // Convert keys to quoted strings
                .replace(/'/g, '"'); // Replace single quotes with double quotes

            const jsonData = JSON.parse(jsonString);
            socketHandler.emit("message", jsonData);
            setJsonInput("");
        } catch (err: unknown) {
            setError("Invalid format");
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center bg-gray-900 p-8">
            <div className="w-full max-w-4xl space-y-8">
                {/* Header */}
                <div className="text-center">
                    <h1 className="text-5xl font-bold text-white mb-2">Crash Game</h1>
                    <p className="text-gray-400">Socket Testing Interface</p>
                </div>

                {/* Main Content Grid */}
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Connection Panel */}
                    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                        <h2 className="text-xl font-semibold text-white mb-4">Connection Settings</h2>
                        <form onSubmit={handleConnect} className="space-y-4">
                            <div>
                                <label className="block text-gray-300 mb-2">Namespace</label>
                                <input
                                    type="text"
                                    value={namespace}
                                    onChange={(e) => setNamespace(e.target.value)}
                                    placeholder="Enter socket name"
                                    className="w-full p-3 border border-gray-700 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    disabled={isConnecting}
                                />
                            </div>

                            {error && (
                                <div className="p-3 bg-red-900/50 border border-red-500 rounded-md text-red-200 text-sm">{error}</div>
                            )}

                            <button
                                type="submit"
                                disabled={!namespace.trim() || isConnecting}
                                className="w-full p-3 rounded-md font-medium transition-colors
                                    bg-blue-600 hover:bg-blue-700 text-white
                                    disabled:bg-gray-600 disabled:text-gray-400
                                    flex items-center justify-center space-x-2"
                            >
                                {isConnecting ? (
                                    <>
                                        <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin" />
                                        <span>Connecting...</span>
                                    </>
                                ) : (
                                    <span>Connect</span>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Message Panel */}
                    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                        <h2 className="text-xl font-semibold text-white mb-4">Message Console</h2>
                        <div className="h-[200px] mb-4 overflow-y-auto border border-gray-700 rounded-md p-4 bg-gray-900">
                            {messages.length === 0 ? (
                                <p className="text-gray-500 text-center italic">No messages yet</p>
                            ) : (
                                messages.map((message, index) => (
                                    <div key={index} className="mb-2 text-sm">
                                        <span className="text-gray-400">{new Date().toLocaleTimeString()}</span>
                                        <pre className="text-green-400 mt-1 whitespace-pre-wrap">{message}</pre>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Message Input Panel */}
                <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                    <h2 className="text-xl font-semibold text-white mb-4">Send Message</h2>
                    <div className="space-y-4">
                        <div className="flex gap-2"></div>
                        <textarea
                            value={jsonInput}
                            onChange={(e) => setJsonInput(e.target.value)}
                            placeholder="Enter Message"
                            className="w-full p-3 h-32 border border-gray-700 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                            disabled={!socketHandler.isConnected()}
                        />
                        <button
                            onClick={handleSubmitMessage}
                            disabled={!socketHandler.isConnected() || !jsonInput.trim()}
                            className="w-full p-3 rounded-md font-medium transition-colors
                                bg-green-600 hover:bg-green-700 text-white
                                disabled:bg-gray-600 disabled:text-gray-400"
                        >
                            Send Message
                        </button>
                    </div>
                </div>

                {/* Connection Status */}
                <div className="fixed bottom-4 right-4">
                    <div
                        className={`px-4 py-2 rounded-full flex items-center space-x-2 
                        ${socketHandler.isConnected() ? "bg-green-600" : "bg-gray-600"}`}
                    >
                        <div className={`w-2 h-2 rounded-full ${socketHandler.isConnected() ? "bg-green-300" : "bg-gray-400"}`} />
                        <span className="text-white text-sm">{socketHandler.isConnected() ? "Connected" : "Disconnected"}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

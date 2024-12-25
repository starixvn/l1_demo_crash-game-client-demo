"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { socketHandler } from "@/handlers/socket.handler";

interface AuthResponse {
    token: string;
    refreshToken: string;
}

export default function SplashPage() {
    const router = useRouter();
    const [namespace, setNamespace] = useState("");
    const [error, setError] = useState("");
    const [isConnecting, setIsConnecting] = useState(false);
    const [userAgent, setUserAgent] = useState("axios/0.27.2");

    useEffect(() => {
        setUserAgent("axios/0.27.2");
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

    const authorize = async (token: string): Promise<void> => {
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
        } catch (error) {
            throw new Error(`Authorization error: ${error}`);
        }
    };

    const handleConnect = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsConnecting(true);
        setError("");

        try {
            // Get SSO token
            const token = await getSSOToken();

            // Authorize with the token
            await authorize(token);

            // Connect to socket with authorized namespace
            await socketHandler.connect(namespace);
            router.push("/game");
        } catch (err) {
            setError(`Connection failed: ${err}`);
        } finally {
            setIsConnecting(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
            <h1 className="text-4xl font-bold mb-8">Crash Game</h1>

            <form onSubmit={handleConnect} className="w-full max-w-md space-y-4">
                <div>
                    <input
                        type="text"
                        value={namespace}
                        onChange={(e) => setNamespace(e.target.value)}
                        placeholder="Enter socket name"
                        className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                        disabled={isConnecting}
                    />
                </div>

                {error && <div className="text-red-500 text-sm">{error}</div>}

                <button
                    type="submit"
                    disabled={!namespace.trim()}
                    className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-gray-300"
                >
                    {isConnecting ? "Connecting..." : "Connect"}
                </button>
            </form>
        </div>
    );
}

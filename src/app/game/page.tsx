"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SocketForm } from "@/components/SocketTester/SocketForm";
import { socketHandler } from "@/handlers/socket.handler";

export default function GamePage() {
    const router = useRouter();
    const [results, setResults] = useState<string[]>([]);

    useEffect(() => {
        // If no socket connection, redirect to splash
        if (!socketHandler.isConnected()) {
            router.push("/");
            return;
        }

        socketHandler.onEvent((event, data) => {
            setResults((prev) => [...prev, `${event}: ${JSON.stringify(data)}`]);
        });

        return () => {
            socketHandler.cleanup();
        };
    }, [router]);

    return (
        <div className="container mx-auto p-4">
            <div className="mb-6">
                <div className="text-sm text-gray-600">Connected to: {socketHandler.getNamespace()}</div>
                <div className="text-sm text-green-600">Status: Connected</div>
            </div>

            <h1 className="text-2xl font-bold mb-4">Socket Tester</h1>

            <SocketForm onResult={(result) => setResults((prev) => [...prev, result])} />

            <div className="mt-8">
                <h2 className="text-xl font-bold mb-2">Results:</h2>
                <textarea readOnly value={results.join("\n")} className="w-full h-64 p-2 border rounded font-mono text-sm" />
            </div>
        </div>
    );
}

import { useState } from "react";
import { socketActions, emitSocketEvent } from "@/utils/socket";

interface SocketFormProps {
    onResult: (result: string) => void;
}

export function SocketForm({ onResult }: SocketFormProps) {
    const [action, setAction] = useState<string>(socketActions.SIGN_IN);
    const [payload, setPayload] = useState("{}");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const parsedPayload = JSON.parse(payload);
            emitSocketEvent(action, parsedPayload);
        } catch (error) {
            onResult(`Error: Invalid JSON payload. ${error}`);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium mb-1">Action:</label>
                <select value={action} onChange={(e) => setAction(e.target.value)} className="w-full p-2 border rounded">
                    {Object.entries(socketActions).map(([key, value]) => (
                        <option key={key} value={value}>
                            {key}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Payload (JSON):</label>
                <textarea value={payload} onChange={(e) => setPayload(e.target.value)} className="w-full p-2 border rounded" rows={5} />
            </div>

            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                Send
            </button>
        </form>
    );
}

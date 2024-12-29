import React from "react";
import type { FormEvent } from "react";

interface ConnectionPanelProps {
    namespace: string;
    setNamespace: (value: string) => void;
    error: string;
    isConnecting: boolean;
    onConnect: (e: FormEvent) => void;
}

export const ConnectionPanel = ({ namespace, setNamespace, error, isConnecting, onConnect }: ConnectionPanelProps) => (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold text-white mb-4">Connection Settings</h2>
        <form onSubmit={onConnect} className="space-y-4">
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

            {error && <div className="p-3 bg-red-900/50 border border-red-500 rounded-md text-red-200 text-sm">{error}</div>}

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
);

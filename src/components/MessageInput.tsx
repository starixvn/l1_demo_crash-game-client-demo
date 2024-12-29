interface MessageInputProps {
    messageNamespace: string;
    setMessageNamespace: (value: string) => void;
    jsonInput: string;
    setJsonInput: (value: string) => void;
    onSubmit: () => void;
    isConnected: boolean;
}

export const MessageInput = ({
    messageNamespace,
    setMessageNamespace,
    jsonInput,
    setJsonInput,
    onSubmit,
    isConnected,
}: MessageInputProps) => (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold text-white mb-4">Send Message</h2>
        <div className="space-y-4">
            <input
                type="text"
                value={messageNamespace}
                onChange={(e) => setMessageNamespace(e.target.value)}
                placeholder="Enter namespace (default: message)"
                className="w-full p-3 border border-gray-700 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!isConnected}
            />
            <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder="Enter Message"
                className="w-full p-3 h-32 border border-gray-700 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                disabled={!isConnected}
            />
            <button
                onClick={onSubmit}
                disabled={!isConnected || !jsonInput.trim()}
                className="w-full p-3 rounded-md font-medium transition-colors
                    bg-green-600 hover:bg-green-700 text-white
                    disabled:bg-gray-600 disabled:text-gray-400"
            >
                Send Message
            </button>
        </div>
    </div>
);

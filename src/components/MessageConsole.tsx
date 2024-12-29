interface MessageConsoleProps {
    messages: string[];
}

export const MessageConsole = ({ messages }: MessageConsoleProps) => (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold text-white mb-4">Message Console</h2>
        <div className="h-[400px] mb-4 overflow-y-auto border border-gray-700 rounded-md p-4 bg-gray-900">
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
);

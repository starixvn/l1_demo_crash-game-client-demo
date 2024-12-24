import "./globals.css";

export const metadata = {
    title: "Socket Tester",
    description: "Test socket.io connections",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}

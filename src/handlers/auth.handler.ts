import { AuthResponse } from "@/types/auth";

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

export const authHandler = {
    getSSOToken: async (userAgent: string): Promise<string> => {
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

            if (!response.ok) {
                throw new Error("Failed to get SSO token");
            }

            const data: AuthResponse = await response.json();
            return data.token;
        } catch (error) {
            throw new Error(`SSO token error: ${error}`);
        }
    },

    authorize: async (token: string, userAgent: string): Promise<object> => {
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
    },
};

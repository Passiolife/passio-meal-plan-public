// Service to handle Passio API authentication
export async function getPassioToken() {
    // Add timeout for auth requests (30 seconds)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
        const response = await fetch(
            `https://api.passiolife.com/v2/token-cache/unified/oauth/token/${process.env.PASSIO_API_KEY}`,
            {
                method: "POST",
                headers: {},
                signal: controller.signal,
            }
        );

        if (!response.ok) {
            throw new Error(
                `Failed to get Passio token: ${response.statusText}`
            );
        }

        const data = await response.json();
        return {
            accessToken: data.access_token,
            customerId: data.customer_id,
            expiresIn: data.expires_in,
        };
    } finally {
        clearTimeout(timeoutId);
    }
}

// Type for the token response
export type PassioToken = {
    accessToken: string;
    customerId: string;
    expiresIn: number;
};

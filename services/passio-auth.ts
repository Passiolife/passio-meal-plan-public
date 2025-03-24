// Service to handle Passio API authentication
export async function getPassioToken() {
  const response = await fetch(
    `https://api.passiolife.com/v2/token-cache/nutrition-advisor/oauth/token/${process.env.PASSIO_API_KEY}`,
    {
      method: 'POST',
      headers: {},
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to get Passio token: ${response.statusText}`);
  }

  const data = await response.json();
  return {
    accessToken: data.access_token,
    customerId: data.customer_id,
    expiresIn: data.expires_in,
  };
}

// Type for the token response
export type PassioToken = {
  accessToken: string;
  customerId: string;
  expiresIn: number;
}; 
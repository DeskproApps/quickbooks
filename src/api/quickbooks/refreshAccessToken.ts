import { placeholders } from '@/constants';
import { IDeskproClient, OAuth2Result, proxyFetch } from '@deskpro/app-sdk';

export default async function refreshAccessToken(client: IDeskproClient) {
    const fetch = await proxyFetch(client);

    const response = await fetch('https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json'
        },
        body: new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: placeholders.OAUTH2_REFRESH_TOKEN_PATH
        }).toString()
    });

    if (!response.ok) {
        throw new Error(`QuickBooks token refresh failed with a status code: ${response.status}`);
    };

    return await response.json() as OAuth2Result['data'];
};
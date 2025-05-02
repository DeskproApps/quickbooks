import { IDeskproClient, OAuth2Result, proxyFetch } from '@deskpro/app-sdk';
import { placeholders } from '@/constants';

export default async function refreshAccessToken(client: IDeskproClient) {
    const fetch = await proxyFetch(client);

    const response = await fetch('https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer', {
        method: 'POST',
        headers: {
            'Authorization': "Basic __client_id+':'+client_secret.base64__",
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json'
        },
        body: `grant_type=refresh_token&refresh_token=[user[${placeholders.OAUTH2_REFRESH_TOKEN_PATH}]]`
    });

    if (!response.ok) {
        throw new Error(`QuickBooks token refresh failed with status code: ${response.status}`);
    };

    return await response.json() as OAuth2Result['data'];
};
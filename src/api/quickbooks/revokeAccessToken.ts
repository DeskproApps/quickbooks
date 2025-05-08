import { IDeskproClient, proxyFetch } from '@deskpro/app-sdk';
import { placeholders } from '@/constants';

export default async function revokeAccessToken(client: IDeskproClient) {
    const fetch = await proxyFetch(client);

    const response = await fetch('https://developer.api.intuit.com/v2/oauth2/tokens/revoke', {
        method: 'POST',
        headers: {
            'Authorization': "Basic __client_id+':'+client_secret.base64__",
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            token: `[user[${placeholders.OAUTH2_REFRESH_TOKEN_PATH}]]`,
        })
    });

    if (!response.ok) {
        throw new Error(`QuickBooks token revocation failed with status code: ${response.status}`);
    };

    return true;
};
import { IDeskproClient, OAuth2Result, proxyFetch } from '@deskpro/app-sdk';
import { placeholders } from '@/constants';

export default async function refreshAccessToken(client: IDeskproClient): Promise<void> {
    const dpFetch = await proxyFetch(client);

    const body = `grant_type=refresh_token&refresh_token=[user[${placeholders.OAUTH2_REFRESH_TOKEN_PATH}]]`


    const refreshRequestOptions: RequestInit = {
        method: "POST",
        body: body,
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Basic __integration_key+':'+secret_key.base64__`,
        },
    }

    const response = await dpFetch('https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer', refreshRequestOptions);

    if (!response.ok) {
        throw new Error(`QuickBooks token refresh failed with status code: ${response.status}`);
    };

    const data = await response.json() as OAuth2Result['data']

    await client.setUserState(placeholders.OAUTH2_ACCESS_TOKEN_PATH, data.access_token, { backend: true });

    if (data.refresh_token) {
        await client.setUserState(placeholders.OAUTH2_REFRESH_TOKEN_PATH, data.refresh_token, { backend: true });
    }
};
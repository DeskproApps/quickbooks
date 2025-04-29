import { IDeskproClient, OAuth2Result, proxyFetch } from "@deskpro/app-sdk";

interface AccessTokenRequestPayload {
    code: string
    redirect_uri: string
}

export default async function getQuickBooksAccessToken(
    client: IDeskproClient,
    params: Readonly<AccessTokenRequestPayload>
): Promise<OAuth2Result["data"]> {
    const fetch = await proxyFetch(client);

    const requestPayload = {
        grant_type: "authorization_code",
        code: params.code,
        redirect_uri: params.redirect_uri,
        client_id: "__client_id__",
        client_secret: "__client_secret__",
    };

    const response = await fetch("https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Accept": "application/json",
        },
        body: new URLSearchParams(requestPayload).toString(),
    });

    if (!response.ok) {
        throw new Error(`QuickBooks token exchange failed with a status code of ${response.status}`);
    }

    return await response.json() as OAuth2Result["data"]
}

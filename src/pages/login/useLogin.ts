import { ContextData, ContextSettings } from '@/types/deskpro';
import { createSearchParams, useNavigate } from 'react-router-dom';
import { getCompanyInfo, getQuickBooksAccessToken } from '@/api/quickbooks';
import { IOAuth2, OAuth2Result, useDeskproLatestAppContext, useInitialisedDeskproAppClient } from '@deskpro/app-sdk';
import { isQuickBooksFaultError, QuickBooksError } from '@/api/quickbooks/baseRequest/baseRequest';
import { GLOBAL_CLIENT_ID, placeholders, SCOPE } from '@/constants';
import { useCallback, useState } from 'react';

interface UseLoginResult {
    onSignIn: () => void,
    authUrl: string | null,
    error: null | string,
    isLoading: boolean,
};

export default function useLogin(): UseLoginResult {
    const [authUrl, setAuthUrl] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false)
    const [isPolling, setIsPolling] = useState(false)
    const [oauth2Context, setOAuth2Context] = useState<IOAuth2 | null>(null)

    const navigate = useNavigate()

    const { context } = useDeskproLatestAppContext<ContextData, ContextSettings>()

    const user = context?.data?.user
    const mode = context?.settings.use_advanced_connect === false ? 'global' : 'local';
    const isUsingSandbox = context?.settings.use_sandbox === true

    // @todo: Update useInitialisedDeskproAppClient typing in the
    // App SDK to to properly handle both async and sync functions

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    useInitialisedDeskproAppClient(async client => {
        if (!context?.settings || !user) {
            return;
        };

        const clientID = context.settings.client_id;

        if (mode === 'local' && typeof clientID !== 'string') {
            return;
        };

        // Start OAuth process depending on the authentication mode
        const oauth2Response = mode === 'global' ? await client.startOauth2Global(GLOBAL_CLIENT_ID) : await client.startOauth2Local(
            ({ state, callbackUrl }) => {
                return `https://appcenter.intuit.com/connect/oauth2?${createSearchParams([
                    ["response_type", "code"],
                    ["client_id", clientID || ''],
                    ["redirect_uri", callbackUrl],
                    ['scope', SCOPE],
                    ["state", state],
                ]).toString()}`;
            },
            /\bcode=(?<code>[^&#]+)/,
            async (code: string): Promise<OAuth2Result> => {
                // Extract the callback URL from the authorization URL
                const url = new URL(oauth2Response.authorizationUrl);
                const redirectUri = url.searchParams.get("redirect_uri")

                if (!redirectUri) {
                    throw new Error("Failed to get callback URL")
                }

                const data: OAuth2Result["data"] = await getQuickBooksAccessToken(client, { code, redirect_uri: redirectUri });

                return { data }
            }
        )

        setAuthUrl(oauth2Response.authorizationUrl)
        setOAuth2Context(oauth2Response)
    }, [context, setAuthUrl]);


    useInitialisedDeskproAppClient((client) => {
        if (!user || !oauth2Context) {
            return
        }

        const startPolling = async () => {
            try {
                const result = await oauth2Context.poll()

                await client.setUserState(placeholders.OAUTH2_ACCESS_TOKEN_PATH, result.data.access_token, { backend: true })

                if (result.data.refresh_token) {
                    await client.setUserState(placeholders.OAUTH2_REFRESH_TOKEN_PATH, result.data.refresh_token, { backend: true })
                }

                try {
                    await getCompanyInfo(client, context.settings.company_id);
                    void navigate('/');
                } catch (error) {
                    if (error instanceof QuickBooksError && isQuickBooksFaultError(error.data)) {
                        const fault = error.data.Fault ?? error.data.fault;

                        switch (fault?.type) {
                            case "AUTHENTICATION":
                                throw new Error("An error occurred while authenticating the user.")
                            case "AuthorizationFault":
                                throw new Error("The user logging in isn't a part of the company specified in the app setup. Contact your admin for more information.");
                            case "AuthenticationFault":
                                if (fault.Error?.[0].Message === "Accessing Wrong Cluster") {
                                    const errorMessage = mode === "global" ?
                                        "Error authenticating user: Sandbox accounts cannot be used with Quick Connect."
                                        :
                                        `Error authenticating user: Ensure the QuickBooks app is setup to use ${isUsingSandbox ? "sandbox" : "production"} accounts.`
                                    throw new Error(errorMessage)
                                }
                                break
                        }
                    };

                    // generic error for all other errors
                    throw new Error(`An unexpected error occurred: ${error instanceof Error ? error.message : "Unknown Error"}.`);
                };
            } catch (error) {
                setError(error instanceof Error ? error.message : 'unknown error');
            } finally {
                setIsLoading(false)
                setIsPolling(false)
            }
        }

        if (isPolling) {
            void startPolling()
        }
    }, [isPolling, user, oauth2Context, navigate, context?.settings.company_id]);

    const onSignIn = useCallback(() => {
        setIsLoading(true);
        setIsPolling(true);
        window.open(authUrl ?? "", '_blank');
    }, [setIsLoading, authUrl]);

    return { authUrl, onSignIn, error, isLoading }

};
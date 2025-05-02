import { ContextData, ContextSettings } from '@/types/deskpro';
import { createSearchParams, useNavigate } from 'react-router-dom';
import { getCompanyInfo, getQuickBooksAccessToken } from '@/api/quickbooks';
import { getLinkedCustomerIds, tryToLinkCustomerAutomatically } from '@/api/deskpro';
import { IOAuth2, OAuth2Result, useDeskproLatestAppContext, useInitialisedDeskproAppClient } from '@deskpro/app-sdk';
import { isQuickBooksFaultError, QuickBooksError } from '@/api/quickbooks/baseRequest/baseRequest';
import { GLOBAL_CLIENT_ID, placeholders } from '@/constants';
import { useCallback, useState } from 'react';

interface UseLoginResult {
    onSignIn: () => void,
    authUrl: string | null,
    error: null | string,
    isLoading: boolean,
};

export default function useLogin(): UseLoginResult {
    const [authUrl, setAuthUrl] = useState<string | null>(null)
    const [error, setError] = useState<null | string>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [isPolling, setIsPolling] = useState(false)
    const [oauth2Context, setOAuth2Context] = useState<IOAuth2 | null>(null)

    const navigate = useNavigate()

    const { context } = useDeskproLatestAppContext<ContextData, ContextSettings>()

    const user = context?.data?.user

    // @todo: Update useInitialisedDeskproAppClient typing in the
    // App SDK to to properly handle both async and sync functions

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    useInitialisedDeskproAppClient(async client => {
        if (!context?.settings || !user) {
            return;
        };

        const clientID = context.settings.client_id;
        const mode = context?.settings.use_advanced_connect ? 'local' : 'global';

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
                    ["scope", "openid profile email com.intuit.quickbooks.accounting"],
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

                getCompanyInfo(client, context.settings.company_id)
                    .catch((e) => {
                        if (e instanceof QuickBooksError && isQuickBooksFaultError(e.data)) {
                            const fault = e.data.Fault ?? e.data.fault


                            if (fault?.type === "AuthorizationFault") {
                                throw new Error("The used in logging in isn't a part of the company specified in the app setup. Contact your admin for more information")
                            }
                        }

                        // Generic error for all other errors
                        throw new Error("Error authenticating user.")
                    })


                try {
                    await tryToLinkCustomerAutomatically(client, { deskproUser: user, companyId: context.settings.company_id });

                    const linkedCustomerIds = await getLinkedCustomerIds(client, user.id)

                    if (linkedCustomerIds.length < 1) {
                        void navigate('/home');
                    } else {
                        void navigate("/customer/view")
                    }

                } catch {
                    void navigate('/home');
                }


            } catch (error) {
                setError(error instanceof Error ? error.message : 'Unknown error');
            } finally {
                setIsLoading(false)
                setIsPolling(false)
            }
        }

        if (isPolling) {
            void startPolling()
        }
    }, [isPolling, user, oauth2Context, navigate])

    const onSignIn = useCallback(() => {
        setIsLoading(true);
        setIsPolling(true);
        window.open(authUrl ?? "", '_blank');
    }, [setIsLoading, authUrl]);

    return { authUrl, onSignIn, error, isLoading }

}

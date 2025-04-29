import { CopyToClipboardInput, IOAuth2, LoadingSpinner, OAuth2Result, useInitialisedDeskproAppClient } from "@deskpro/app-sdk";
import { createSearchParams } from "react-router-dom";
import { P1 } from "@deskpro/deskpro-ui";
import { ThemeProps } from "@/types/general";
import { useState } from "react";
import styled from "styled-components";

const Description = styled(P1)`
  margin-top: 8px;
  margin-bottom: 16px;
  color: ${({ theme }: ThemeProps) => theme.colors.grey80};
`;

export default function AdminCallbackPage(): JSX.Element {
    const [callbackUrl, setCallbackUrl] = useState<string | null>(null)

    // @todo: Update useInitialisedDeskproAppClient typing in the
    // App SDK to to properly handle both async and sync functions

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    useInitialisedDeskproAppClient(async (client) => {
        const oauth2: IOAuth2 = await client.startOauth2Local(
            ({ callbackUrl, state }: { callbackUrl: string; state: string }) => {
                return `https://appcenter.intuit.com/connect/oauth2?${createSearchParams([
                    ["response_type", "code"],
                    ["client_id", "xxx"],
                    ["state", state],
                    ["redirect_uri", callbackUrl],
                    ["scope", "com.intuit.quickbooks.accounting com.intuit.quickbooks.payment"],
                ]).toString()}`;
            },
            /code=(?<code>[0-9a-f]+)/,
            // Disabling eslint here because the function does not perform any asynchronous operations
            // and we don't need to await anything
            // eslint-disable-next-line @typescript-eslint/require-await
            async (): Promise<OAuth2Result> => {
                return { data: { access_token: "", refresh_token: "" } };
            }
        );

        const url = new URL(oauth2.authorizationUrl);
        const redirectUri = url.searchParams.get("redirect_uri")

        if (redirectUri) {
            setCallbackUrl(redirectUri)
        }
    }, [])

    if (!callbackUrl) {
        return (<LoadingSpinner />)
    }

    return (
        <>
            <CopyToClipboardInput value={callbackUrl} />
            <Description>The callback URL will be required during the QuickBooks app setup</Description>
        </>
    )
}
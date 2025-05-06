import { useState } from 'react';
import { createSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { CopyToClipboardInput, LoadingSpinner, useInitialisedDeskproAppClient } from '@deskpro/app-sdk';
import { P1 } from '@deskpro/deskpro-ui';
import { SCOPE } from '@/constants';
import { ThemeProps } from '@/types/general';

const Description = styled(P1)`
    margin-top: 8px;
    margin-bottom: 16px;
    color: ${({ theme }: ThemeProps) => theme.colors.grey80};
`;

function AdminCallbackPage() {
    const [callbackURL, setCallbackURL] = useState<string | null>(null);

    useInitialisedDeskproAppClient(client => {
        void (async () => {
            await client.startOauth2Local(
                ({ callbackUrl, state }) => {
                    setCallbackURL(callbackUrl);

                    return `https://appcenter.intuit.com/connect/oauth2?${createSearchParams([
                        ['client_id', 'adminCallBack'],
                        ['state', state],
                        ['response_type', 'code'],
                        ['redirect_uri', callbackUrl],
                        ['scope', SCOPE],
                    ]).toString()}`;
                },
                /^$/,
                async () => {
                    return Promise.resolve({data: {access_token:''}});
                }
            );
        })();
    }, []);

    if (!callbackURL) {
        return <LoadingSpinner />
    };

    return (
        <>
            <CopyToClipboardInput value={callbackURL} />
            <Description>The callback URL will be required during the QuickBooks app setup</Description>
        </>
    );
};

export default AdminCallbackPage;
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDeskproAppClient } from '@deskpro/app-sdk';
import revokeAccessToken from '@/api/quickbooks/revokeAccessToken';

export function useLogOut() {
    const { client } = useDeskproAppClient();
    const navigate = useNavigate();

    const logOut = useCallback(() => {
        if (!client) {
            return;
        };

        client.setBadgeCount(0);
        revokeAccessToken(client)
            .finally(() => {
                navigate('/login');
            });
    }, [client, navigate]);

    return { logOut };
};
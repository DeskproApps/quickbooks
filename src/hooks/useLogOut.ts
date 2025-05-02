import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDeskproAppClient } from '@deskpro/app-sdk';
import revokeAccessToken from '@/api/quickbooks/revokeAccessToken';

export function useLogOut() {
    const { client } = useDeskproAppClient();
    const navigate = useNavigate();

    const logOut = useCallback(async () => {
        if (!client) {
            return;
        };

        try {
            client.setBadgeCount(0);
            await revokeAccessToken(client);
        } finally {
            void navigate('/login');
        };
    }, [client, navigate]);

    return { logOut };
};
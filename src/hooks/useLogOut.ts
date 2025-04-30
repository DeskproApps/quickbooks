import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDeskproAppClient } from '@deskpro/app-sdk';
import { placeholders } from '@/constants';

export function useLogOut() {
    const { client } = useDeskproAppClient();
    const navigate = useNavigate();

    const logOut = useCallback(() => {
        if (!client) {
            return;
        };

        client.setBadgeCount(0);
        client.deleteUserState(placeholders.OAUTH2_ACCESS_TOKEN_PATH)
            .finally(() => {
                navigate('/login');
            });
    }, [client, navigate]);

    return { logOut };
};
import { ContextData, ContextSettings } from "@/types/deskpro";
import { getCompanyInfo } from "@/api/quickbooks";
import { getLinkedCustomerIds, tryToLinkCustomerAutomatically } from "@/api/deskpro";
import { LoadingSpinner, useDeskproAppClient, useDeskproElements, useDeskproLatestAppContext, useInitialisedDeskproAppClient } from '@deskpro/app-sdk';
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { placeholders } from '@/constants';

export default function LoadingPage() {
    const { client } = useDeskproAppClient()
    const { context } = useDeskproLatestAppContext<ContextData, ContextSettings>()

    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
    const [isFetchingAuth, setIsFetchingAuth] = useState<boolean>(true)

    const navigate = useNavigate()

    const user = context?.data?.user

    useDeskproElements(({ clearElements, registerElement }) => {
        clearElements();
        registerElement('refresh', { type: 'refresh_button' });
    }, []);

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    useInitialisedDeskproAppClient(async client => {
        client.setTitle('QuickBooks');

        if (!context || !user) {
            return;
        };

        const isUsingSandbox = context.settings.use_sandbox;

        await client.setUserState(placeholders.IS_USING_SANDBOX, isUsingSandbox);

        try {
            const company = await getCompanyInfo(client, context.settings.company_id);

            if (company) {
                setIsAuthenticated(true);
            };
        } catch (error) {
            // eslint-disable-next-line no-console
            console.log('error authenticating user');
        } finally {
            setIsFetchingAuth(false);
        };
    }, [context, context?.settings]);


    if (!client || !user || isFetchingAuth) {
        return <LoadingSpinner />
    }

    if (isAuthenticated) {
        tryToLinkCustomerAutomatically(client, { deskproUser: user, companyId: context.settings.company_id })
            .then(() => getLinkedCustomerIds(client, user.id))
            .then((linkedCustomerIds) => {
                if (linkedCustomerIds.length < 1) {
                    void navigate('/home');
                } else {
                    void navigate("/customers/view");
                };
            })
            .catch(() => { void navigate('/home'); })
    } else {
        void navigate("/login")
    }

    return <LoadingSpinner />
};
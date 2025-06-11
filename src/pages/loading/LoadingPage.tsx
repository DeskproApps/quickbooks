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
    const isUsingGlobalProxy = context?.settings.use_advanced_connect === false
    const isUsingSandbox = context?.settings.use_sandbox === true;
    const companyId = context?.settings.company_id

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    useInitialisedDeskproAppClient(async client => {
        client.setTitle('QuickBooks');

        if (!companyId || !user) {
            return;
        };


        await client.setUserState(placeholders.IS_USING_SANDBOX, isUsingSandbox);
        await client.setUserState("isUsingGlobalProxy", isUsingGlobalProxy)


        try {
            const company = await getCompanyInfo(client, companyId);

            if (company) {
                setIsAuthenticated(true);
            };
        } catch (error) {
            // eslint-disable-next-line no-console
            console.log('error authenticating user');
        } finally {
            setIsFetchingAuth(false);
        };
    }, [isUsingSandbox, companyId, isUsingGlobalProxy]);


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
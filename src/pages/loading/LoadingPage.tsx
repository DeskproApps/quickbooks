import { ContextData, ContextSettings } from "@/types/deskpro";
import { getCompanyInfo } from "@/api/quickbooks";
import { getLinkedCustomerIds, tryToLinkCustomerAutomatically } from "@/api/deskpro";
import { LoadingSpinner, useDeskproAppClient, useDeskproElements, useDeskproLatestAppContext, useInitialisedDeskproAppClient } from '@deskpro/app-sdk';
import { useNavigate } from "react-router-dom";
import { useState } from "react";

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

    useInitialisedDeskproAppClient((client) => {
        client.setTitle("QuickBooks")

        if (!context || !user) {
            return
        }

        // Verify authentication status
        getCompanyInfo(client, context.settings.company_id)
            .then((user) => {
                if (user) {
                    setIsAuthenticated(true)
                }
            })

            // eslint-disable-next-line no-console
            .catch(() => { console.log("User not authenticated") })
            .finally(() => {
                setIsFetchingAuth(false)
            })
    }, [context, context?.settings])


    if (!client || !user || isFetchingAuth) {
        return (<LoadingSpinner />)
    }

    if (isAuthenticated) {

        tryToLinkCustomerAutomatically(client, { deskproUser: user, companyId: context.settings.company_id })
            .then(() => getLinkedCustomerIds(client, user.id))
            .then((linkedCustomerIds) => {
                if (linkedCustomerIds.length < 1) {
                    void navigate("/customers/link")
                } else {
                    void navigate("/customers/view");
                };
            })
            .catch(() => { void navigate("/customers/link") })
    } else {
        void navigate("/login")
    }

    return (
        <LoadingSpinner />
    );
}
import { AnchorButton, H3, Stack } from "@deskpro/deskpro-ui";
import { useDeskproElements, useInitialisedDeskproAppClient } from '@deskpro/app-sdk';
import ErrorBlock from "@/components/ErrorBlock/ErrorBlock";
import useLogIn from "./useLogin";

export default function LoginPage() {
    useDeskproElements(({ clearElements, registerElement }) => {
        clearElements();
        registerElement('refresh', { type: 'refresh_button' });
    }, []);

    // Reset the badge count & title
    useInitialisedDeskproAppClient((client) => {
        client.setBadgeCount(0)
        client.setTitle("QuickBooks")
    }, [])

    const { authUrl, isLoading, onSignIn, error } = useLogIn()

    return (
        <Stack vertical gap={12} padding={12}>
            <H3>Log into your QuickBooks account</H3>
            <AnchorButton
                disabled={!authUrl || isLoading}
                href={authUrl ?? "#"}
                loading={isLoading}
                onClick={onSignIn}
                target={"_blank"}
                text={"Log In"}
            />
            {error && <ErrorBlock>{error}</ErrorBlock>}
        </Stack>)
}
import { Button, H0, Stack } from "@deskpro/deskpro-ui"
import { FC } from "react"
import { useInitialisedDeskproAppClient } from '@deskpro/app-sdk'
import { useNavigate } from "react-router-dom"
import { useRegisterElements } from "@/hooks/useRegisterElements"


const NotFoundPage: FC = () => {
    const navigate = useNavigate()

    useRegisterElements(({ registerElement }) => {
        registerElement('refresh', { type: 'refresh_button' });
    }, []);

    useInitialisedDeskproAppClient((client) => {
        client.setTitle("QuickBooks")
    })

    return (
        <Stack vertical gap={10} padding={10} justify={"center"} align={"center"}>
            <H0>Page Not Found</H0>

            <Button text={"Go To Home"} intent={"secondary"} onClick={() => { void navigate("/home") }} />
        </Stack>)
}

export default NotFoundPage
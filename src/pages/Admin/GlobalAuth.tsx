import { useDeskproAppTheme, CopyToClipboardInput } from "@deskpro/app-sdk";
import { useGlobalAuth } from "../../hooks/UseGlobalAuth";
import { Link } from "react-router-dom";
import { useEffect } from "react";
import { Button, H1, H2, P1, Stack } from "@deskpro/deskpro-ui";

export const GlobalAuth = () => {
  const { theme } = useDeskproAppTheme();

  useEffect(() => {
    document.body.style.margin = "0px";
  }, []);

  const { callbackUrl, signIn, message, authUrl } = useGlobalAuth();

  return (
    <Stack vertical gap={10} style={{ margin: "0px", height: "1000px" }}>
      {callbackUrl && (
        <>
          <H2 style={{ marginBottom: "5px" }}>Callback URL</H2>
          <CopyToClipboardInput value={callbackUrl}></CopyToClipboardInput>
          <P1
            style={{
              marginBottom: "16px",
              marginTop: "8px",
              color: theme.colors.grey80,
            }}
          >
            The callback URL will be required during the QuickBooks app setup
          </P1>
        </>
      )}
      {authUrl && !message?.success && (
        <Link to={authUrl} target="_blank">
          <Button
            text="Sign In"
            data-testid="submit-button"
            onClick={signIn}
          ></Button>
        </Link>
      )}
      {!message ? (
        <div></div>
      ) : message.error ? (
        <H1 style={{ color: theme?.colors?.red100 }}>{message.error}</H1>
      ) : (
        <H1>{message.success}</H1>
      )}
    </Stack>
  );
};

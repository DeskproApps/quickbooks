// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
import { v4 as uuidv4 } from "uuid";
import { useEffect, useMemo, useState } from "react";
import {
  useDeskproAppClient,
  useDeskproAppEvents,
  useInitialisedDeskproAppClient,
} from "@deskpro/app-sdk";

import { getAccessAndRefreshTokens } from "../api/preInstallApi";
import { ISettings } from "../types/settings";

export const useGlobalAuth = () => {
  const { client } = useDeskproAppClient();
  const key = useMemo(() => uuidv4(), []);

  const [callbackUrl, setCallbackUrl] = useState<string | null>(null);
  const [authUrl, setAuthUrl] = useState<string | null>(null);

  const [poll, setPoll] = useState<(() => Promise<{ token: string }>) | null>(
    null
  );
  const [oauth2Tokens, setOauth2Tokens] = useState<Record<
    string,
    string
  > | null>(null);
  const [settings, setSettings] = useState<ISettings | null>(null);
  const [accessCode, setAccessCode] = useState<string | null>(null);
  const [message, setMessage] = useState<{
    error?: string;
    success?: string;
  } | null>(null);

  useDeskproAppEvents(
    {
      onAdminSettingsChange: setSettings,
    },
    []
  );

  useInitialisedDeskproAppClient(
    (client) => {
      (async () => {
        const { callbackUrl, poll } = await client
          .oauth2()
          .getAdminGenericCallbackUrl(
            key,
            /\?(code)=(?<token>[^&]+)/,
            // eslint-disable-next-line no-useless-escape
            /(&state)=(?<key>[^&]+)/
          );

        setCallbackUrl(callbackUrl);

        setPoll(() => poll);
      })();
    },
    [key]
  );

  useEffect(() => {
    if (!key || !callbackUrl) return;

    setAuthUrl(
      `https://appcenter.intuit.com/connect/oauth2?response_type=code&client_id=${
        settings?.client_id
      }&redirect_uri=${new URL(
        callbackUrl as string
      ).toString()}&scope=com.intuit.quickbooks.accounting%20openid%20profile%20email%20phone%20address&state=${key}`
    );
  }, [settings?.client_id, callbackUrl, key]);

  const signOut = () => {
    client?.setAdminSetting("");

    setAccessCode(null);
  };

  const signIn = async () => {
    if (!callbackUrl || !poll) {
      setMessage({
        error:
          "Error getting callback URL. Please wait for the app to be initialized.",
      });

      return;
    }

    const code = await poll()
      .then((e) => e.token)
      .catch(() => false);

    if (!code) {
      setMessage({
        error: "Error getting access code. Please try again.",
      });

      return;
    }

    setAccessCode(code as string);
  };

  useInitialisedDeskproAppClient(
    (client) => {
      if (![accessCode, callbackUrl, settings].every((e) => e)) return;

      (async () => {
        const tokens = await getAccessAndRefreshTokens(
          settings as ISettings,
          accessCode as string,
          callbackUrl as string,
          client
        );

        if (tokens.error) {
          setMessage({
            error: "Error signing in. Please try again: " + tokens.error,
          });

          return;
        }

        setOauth2Tokens(tokens);

        setMessage({
          success: `Successfully signed in.`,
        });
      })();
    },
    [accessCode, callbackUrl]
  );

  useEffect(() => {
    if (!client || !oauth2Tokens) return;

    client.setAdminSetting(JSON.stringify({ ...oauth2Tokens }));
  }, [client, oauth2Tokens]);

  return {
    callbackUrl,
    poll,
    key,
    setAccessCode,
    signIn,
    signOut,
    message,
    authUrl,
  };
};

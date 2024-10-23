// Home tsx

import { getTokens } from "next-firebase-auth-edge";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { clientConfig, serverConfig } from "../config";
import SurveyManagerPage from "./survey-manager/page";

export default async function Home() {
  const tokens = await getTokens(cookies(), {
    apiKey: clientConfig.apiKey,
    cookieName: serverConfig.cookieName,
    cookieSignatureKeys: serverConfig.cookieSignatureKeys,
    serviceAccount: serverConfig.serviceAccount,

    // UID in tokens.decodedToken.uid
  });

  if (!tokens) {
    notFound();
  }

  return <SurveyManagerPage />
}
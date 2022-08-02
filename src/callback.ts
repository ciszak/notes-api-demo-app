import fetch from "node-fetch";
import { APIGatewayProxyEventV2WithJWTAuthorizer } from "aws-lambda";
import {
  formatRequestErrorResponse,
  formatSuccessResponse,
} from "./api/response";
import { URL, URLSearchParams } from "url";

/**
 * It's just a demo and should never be deployed on production.
 */
export const handler = async (
  event: APIGatewayProxyEventV2WithJWTAuthorizer
) => {
  const code = event.queryStringParameters?.code;

  if (!code) {
    return formatRequestErrorResponse("No code", undefined, 422);
  }

  const body = new URLSearchParams();

  body.append("grant_type", "authorization_code");
  body.append("redirect_uri", process.env.REDIRECT_URI!);
  body.append("client_id", process.env.CLIENT_ID!);
  body.append("code", code);

  const tokenEndpoint = new URL("/oauth2/token", process.env.AUTH_ENDPOINT);

  try {
    const response = await fetch(tokenEndpoint.href, {
      method: "POST",
      body,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    return formatSuccessResponse((await response.json()) as object);
  } catch (e) {
    return formatRequestErrorResponse("nope", e, 400);
  }
};

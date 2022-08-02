import { ZodError } from "zod";
import { ConditionalCheckFailedException } from "@aws-sdk/client-dynamodb";
import { APIGatewayProxyEventV2WithJWTAuthorizer } from "aws-lambda";

import { update } from "./datastore";
import { formatRequestErrorResponse, formatSuccessResponse } from "../response";
import { validateApiFormat } from "./schema";

export const handler = async (
  event: APIGatewayProxyEventV2WithJWTAuthorizer
) => {
  if (!event.body) {
    return formatRequestErrorResponse("Empty request", undefined, 422);
  }

  try {
    const input = JSON.parse(event.body);
    const sanitizedInput = validateApiFormat(input);

    const owner = event.requestContext.authorizer.jwt.claims.sub as string;
    const id = event.pathParameters!.id!;

    await update(owner, id, sanitizedInput);

    return formatSuccessResponse(undefined, 204);
  } catch (error) {
    if (error instanceof SyntaxError) {
      return formatRequestErrorResponse("Invalid request", error.message, 422);
    }

    if (error instanceof ZodError) {
      return formatRequestErrorResponse(
        "Invalid request",
        error.flatten(),
        422
      );
    }

    if (error instanceof ConditionalCheckFailedException) {
      return formatRequestErrorResponse(
        "Note doesn't exist",
        error.message,
        404
      );
    }

    /* istanbul ignore next (won't work, because esbuild strips comments) */
    throw error;
  }
};

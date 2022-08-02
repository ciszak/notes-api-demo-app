import { APIGatewayProxyEventV2WithJWTAuthorizer } from "aws-lambda";
import { ZodError } from "zod";
import { formatRequestErrorResponse, formatSuccessResponse } from "../response";

import { noteSchema } from "./schema";
import { create } from "./datastore";

export const handler = async (
  event: APIGatewayProxyEventV2WithJWTAuthorizer
) => {
  if (!event.body) {
    return formatRequestErrorResponse("Empty request", undefined, 422);
  }

  try {
    const input = JSON.parse(event.body);
    const sanitizedInput = noteSchema.strict().parse(input);

    const owner = event.requestContext.authorizer.jwt.claims.sub as string;

    await create(owner, sanitizedInput);

    return formatSuccessResponse(undefined, 201);
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

    /* istanbul ignore next (won't work, because esbuild strips comments) */
    throw error;
  }
};

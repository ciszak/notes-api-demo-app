import { APIGatewayProxyEventV2WithJWTAuthorizer } from "aws-lambda";

import { get } from "./datastore";
import { formatRequestErrorResponse, formatSuccessResponse } from "../response";
import { convertToApiFormat } from "./schema";

export const handler = async (
  event: APIGatewayProxyEventV2WithJWTAuthorizer
) => {
  const owner = event.requestContext.authorizer.jwt.claims.sub as string;
  const id = event.pathParameters!.id!;

  const result = await get(owner, id);

  if (!result.Item) {
    return formatRequestErrorResponse("Note doesn't exist", undefined, 404);
  }

  const note = convertToApiFormat(result.Item);

  return formatSuccessResponse(note, 201);
};

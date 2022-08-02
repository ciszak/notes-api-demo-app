import { APIGatewayProxyEventV2WithJWTAuthorizer } from "aws-lambda";

import { remove } from "./datastore";
import { formatSuccessResponse } from "../response";

export const handler = async (
  event: APIGatewayProxyEventV2WithJWTAuthorizer
) => {
  const owner = event.requestContext.authorizer.jwt.claims.sub as string;
  const id = event.pathParameters!.id!;

  await remove(owner, id);

  return formatSuccessResponse(undefined, 204);
};

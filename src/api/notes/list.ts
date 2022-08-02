import { APIGatewayProxyEventV2WithJWTAuthorizer } from "aws-lambda";

import { list } from "./datastore";
import { formatSuccessResponse } from "../response";
import { convertToApiFormat } from "./schema";

export const handler = async (
  event: APIGatewayProxyEventV2WithJWTAuthorizer
) => {
  const owner = event.requestContext.authorizer.jwt.claims.sub as string;

  const result = await list(owner);

  const notes = result.Items!.map((note) => convertToApiFormat(note));

  return formatSuccessResponse(notes, 201);
};

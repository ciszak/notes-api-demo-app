import { APIGatewayProxyStructuredResultV2 } from "aws-lambda";

export const formatResponse = (payload?: string | object) =>
  payload
    ? {
        body: typeof payload == "string" ? payload : JSON.stringify(payload),
        headers: { "content-type": "application/json" },
      }
    : {};

export const formatRequestErrorResponse = (
  message: string,
  details?: any,
  statusCode: number = 400
): APIGatewayProxyStructuredResultV2 => ({
  statusCode,
  ...formatResponse({ message, details }),
});

export const formatSuccessResponse = (
  payload?: string | object,
  statusCode: number = 200
): APIGatewayProxyStructuredResultV2 => ({
  statusCode,
  ...formatResponse(payload),
});

import { APIGatewayProxyEventV2WithJWTAuthorizer } from "aws-lambda";
import { v4 as uuidv4 } from "uuid";
import { merge } from "merge-anything";

const emptyEvent: APIGatewayProxyEventV2WithJWTAuthorizer = require("./base-event.json");

const generateFakeJWT = () => ({
  claims: {
    auth_time: "1659291079",
    client_id: "70qkl7fud0e1l665f1cmtkin1s",
    event_id: uuidv4(),
    exp: "1659294679",
    iat: "1659291079",
    iss: "https://cognito-idp.eu-central-1.amazonaws.com/eu-central-1_tREMpaAqP",
    jti: uuidv4(),
    origin_jti: uuidv4(),
    scope: "aws.cognito.signin.user.admin phone openid profile email",
    sub: uuidv4(),
    token_use: "access",
    username: "someuser",
    version: "2",
  },
  scopes: [],
});

const generateEmptyEventWithJWT = () =>
  merge(emptyEvent, {
    requestContext: {
      authorizer: {
        jwt: generateFakeJWT(),
      },
    },
  });

export const generateEvent = (
  overrides?: Partial<APIGatewayProxyEventV2WithJWTAuthorizer>
) => merge(generateEmptyEventWithJWT(), overrides ?? {});

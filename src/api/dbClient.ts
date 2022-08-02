import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const isTest = process.env.NODE_ENV === "test";

const config = {
  ...(isTest && {
    endpoint: "http://localhost:8000",
    sslEnabled: false,
    region: "local-env",
    credentials: {
      accessKeyId: "fakeKeyId",
      secretAccessKey: "fakeSecretAccessKey",
    },
  }),
};

/**
 * clients are constructed in global scope so it can be reused on subsequent lambda calls
 */
export const client = new DynamoDBClient(config);
export const documentClient = DynamoDBDocumentClient.from(client);

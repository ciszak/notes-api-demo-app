import {
  CreateTableCommand,
  CreateTableCommandInput,
  DeleteTableCommand,
  DynamoDBClient,
} from "@aws-sdk/client-dynamodb";
import { client } from "../src/api/dbClient";
import { TableName } from "../src/api/notes/datastore";

const tables: CreateTableCommandInput[] = [
  {
    TableName,
    KeySchema: [
      { AttributeName: "owner_id", KeyType: "HASH" },
      { AttributeName: "id", KeyType: "RANGE" },
    ],
    AttributeDefinitions: [
      { AttributeName: "owner_id", AttributeType: "S" },
      { AttributeName: "id", AttributeType: "S" },
    ],
    ProvisionedThroughput: { ReadCapacityUnits: 1, WriteCapacityUnits: 1 },
  },
];

export const setupDatabase = async () => {
  await createTables(client, tables);
};

export const teardownDatabase = async () => {
  return deleteTables(
    client,
    tables.map((table) => table.TableName!)
  );
};

export const createTables = (
  client: DynamoDBClient,
  tables: CreateTableCommandInput[]
) => {
  return Promise.all(
    tables.map((table) => client.send(new CreateTableCommand(table)))
  );
};

export const deleteTables = (client: DynamoDBClient, tableNames: string[]) => {
  return Promise.all(
    tableNames.map((tableName) =>
      client.send(new DeleteTableCommand({ TableName: tableName }))
    )
  );
};

import { ulid } from "ulid";
import {
  DeleteCommand,
  GetCommand,
  PutCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import { documentClient } from "../dbClient";

import { Note } from "./schema";

export const TableName = process.env.NOTES_TABLE || "Notes";

export const get = async (owner_id: string, id: string) => {
  return await documentClient.send(
    new GetCommand({
      TableName,
      Key: { owner_id, id },
    })
  );
};

export const list = async (owner_id: string) => {
  return await documentClient.send(
    new QueryCommand({
      TableName,
      KeyConditionExpression: "owner_id = :o",
      ExpressionAttributeValues: {
        ":o": owner_id,
      },
    })
  );
};

export const create = async (owner_id: string, note: Note) => {
  return await documentClient.send(
    new PutCommand({
      TableName,
      Item: {
        ...note,
        owner_id,
        id: ulid(),
      },
    })
  );
};

export const update = async (owner_id: string, id: string, note: Note) => {
  return await documentClient.send(
    new PutCommand({
      TableName,
      Item: {
        owner_id,
        id,
        ...note,
      },
      ConditionExpression: "attribute_exists(id)",
    })
  );
};

export const remove = async (owner_id: string, id: string) => {
  return await documentClient.send(
    new DeleteCommand({
      TableName,
      Key: { owner_id, id },
    })
  );
};

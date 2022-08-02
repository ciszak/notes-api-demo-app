import { APIGatewayProxyEventV2WithJWTAuthorizer } from "aws-lambda";

import { generateEvent } from "./test-utils";

import { Note } from "../schema";

import { handler } from "../create";

test("saves a note", async () => {
  const note: Note = {
    title: "Important note",
    body: "Remember the milk!",
  };
  const event: APIGatewayProxyEventV2WithJWTAuthorizer = generateEvent({
    body: JSON.stringify(note),
  });

  expect(await handler(event)).toMatchObject({ statusCode: 201 });
});

test("return an error on empty request data", async () => {
  const result = await handler(generateEvent());

  expect(result).toMatchInlineSnapshot(`
Object {
  "body": "{\\"message\\":\\"Empty request\\"}",
  "headers": Object {
    "content-type": "application/json",
  },
  "statusCode": 422,
}
`);
});

test("return an error on not-a-json request", async () => {
  const event: APIGatewayProxyEventV2WithJWTAuthorizer = generateEvent({
    body: "not a json",
  });

  expect(await handler(event)).toMatchInlineSnapshot(`
Object {
  "body": "{\\"message\\":\\"Invalid request\\",\\"details\\":\\"Unexpected token o in JSON at position 1\\"}",
  "headers": Object {
    "content-type": "application/json",
  },
  "statusCode": 422,
}
`);
});

test("return an error on empty json", async () => {
  const event: APIGatewayProxyEventV2WithJWTAuthorizer = generateEvent({
    body: JSON.stringify({}),
  });

  expect(await handler(event)).toMatchInlineSnapshot(`
  Object {
    "body": "{\\"message\\":\\"Invalid request\\",\\"details\\":{\\"formErrors\\":[],\\"fieldErrors\\":{\\"title\\":[\\"Required\\"],\\"body\\":[\\"Required\\"]}}}",
    "headers": Object {
      "content-type": "application/json",
    },
    "statusCode": 422,
  }
  `);
});

test("return an error on empty title", async () => {
  const event: APIGatewayProxyEventV2WithJWTAuthorizer = generateEvent({
    body: JSON.stringify({ title: "", body: "as per the title..." }),
  });

  expect(await handler(event)).toMatchInlineSnapshot(`
Object {
  "body": "{\\"message\\":\\"Invalid request\\",\\"details\\":{\\"formErrors\\":[],\\"fieldErrors\\":{\\"title\\":[\\"String must contain at least 1 character(s)\\"]}}}",
  "headers": Object {
    "content-type": "application/json",
  },
  "statusCode": 422,
}
`);
});

test("empty body is accepted", async () => {
  const event: APIGatewayProxyEventV2WithJWTAuthorizer = generateEvent({
    body: JSON.stringify({ title: "Important note", body: "" }),
  });

  expect(await handler(event)).toMatchObject({ statusCode: 201 });
});

test("return an error on unknown parameter", async () => {
  const event: APIGatewayProxyEventV2WithJWTAuthorizer = generateEvent({
    body: JSON.stringify({ unknown: "parameter" }),
  });

  expect(await handler(event)).toMatchInlineSnapshot(`
Object {
  "body": "{\\"message\\":\\"Invalid request\\",\\"details\\":{\\"formErrors\\":[\\"Unrecognized key(s) in object: 'unknown'\\"],\\"fieldErrors\\":{\\"title\\":[\\"Required\\"],\\"body\\":[\\"Required\\"]}}}",
  "headers": Object {
    "content-type": "application/json",
  },
  "statusCode": 422,
}
`);
});

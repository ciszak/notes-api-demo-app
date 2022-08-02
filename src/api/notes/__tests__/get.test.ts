import { generateEvent } from "./test-utils";

import { Note } from "../schema";

import { handler as createHandler } from "../create";
import { handler as listHandler } from "../list";
import { handler as getHandler } from "../get";

test("returns 404 when note doesn't exist", async () => {
  const event = generateEvent({ pathParameters: { id: "non-existent" } });

  expect(await getHandler(event)).toMatchObject({ statusCode: 404 });
});

test("should return notes", async () => {
  const userOneEmptyEvent = generateEvent();

  const userOneNote: Note = {
    title: "User one's note",
    body: "Remember the milk!",
  };

  await createHandler({
    ...userOneEmptyEvent,
    body: JSON.stringify(userOneNote),
  });

  const listResult = await listHandler(userOneEmptyEvent);
  const parsedListResult = JSON.parse(listResult.body!);

  const getResult = await getHandler({
    ...userOneEmptyEvent,
    pathParameters: { id: parsedListResult[0].id },
  });

  const parsedGetResult = JSON.parse(getResult.body!);

  expect(parsedGetResult).toMatchObject(userOneNote);
});

test("should return notes of the current user only", async () => {
  const userOneEmptyEvent = generateEvent();
  const userTwoEmptyEvent = generateEvent();

  const userOneNote: Note = {
    title: "User one's note",
    body: "Remember the milk!",
  };

  await createHandler({
    ...userOneEmptyEvent,
    body: JSON.stringify(userOneNote),
  });

  const listResult = await listHandler(userOneEmptyEvent);
  const parsedListResult = JSON.parse(listResult.body!);

  const getResult = await getHandler({
    ...userTwoEmptyEvent,
    pathParameters: { id: parsedListResult[0].id },
  });

  expect(getResult).toMatchObject({ statusCode: 404 });
});

import { generateEvent } from "./test-utils";

import { Note } from "../schema";

import { handler as createHandler } from "../create";
import { handler as getHandler } from "../get";
import { handler as listHandler } from "../list";
import { handler as updateHandler } from "../update";

test("updates a note", async () => {
  const userOneEmptyEvent = generateEvent();

  const userOneNote: Note = {
    title: "User one's note",
    body: "Remember the milk!",
  };

  const userOneNoteUpdated: Note = {
    title: "Updated note",
    body: "Remember the whisky!",
  };

  await createHandler({
    ...userOneEmptyEvent,
    body: JSON.stringify(userOneNote),
  });

  const listResult = await listHandler(userOneEmptyEvent);
  const parsedListResult = JSON.parse(listResult.body!);

  const id = parsedListResult[0].id;

  const updateResult = await updateHandler({
    ...userOneEmptyEvent,
    pathParameters: { id },
    body: JSON.stringify(userOneNoteUpdated),
  });

  expect(updateResult).toMatchObject({ statusCode: 204 });

  const getAfterUpdateResult = await getHandler({
    ...userOneEmptyEvent,
    pathParameters: { id },
  });
  const parsedGetAfterUpdateResult = JSON.parse(getAfterUpdateResult.body!);

  expect(parsedGetAfterUpdateResult).toMatchObject(userOneNoteUpdated);
});

test("returns 404 on call to non-existent item", async () => {
  const userOneNoteUpdated: Note = {
    title: "Updated note",
    body: "Remember the whisky!",
  };

  const updateResult = await updateHandler(
    generateEvent({
      pathParameters: { id: "non-existent" },
      body: JSON.stringify(userOneNoteUpdated),
    })
  );

  expect(updateResult).toMatchObject({ statusCode: 404 });
});

test("return an error on empty request data", async () => {
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

  const id = parsedListResult[0].id;

  const updateResult = await updateHandler({
    ...userOneEmptyEvent,
    pathParameters: { id },
  });

  expect(updateResult).toMatchObject({ statusCode: 422 });
});

test("return an error on empty request data", async () => {
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

  const id = parsedListResult[0].id;

  const updateResult = await updateHandler({
    ...userOneEmptyEvent,
    pathParameters: { id },
    body: "not-a-json",
  });

  expect(updateResult).toMatchObject({ statusCode: 422 });
});

test("return an error on empty request data", async () => {
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

  const id = parsedListResult[0].id;

  const updateResult = await updateHandler({
    ...userOneEmptyEvent,
    pathParameters: { id },
    body: JSON.stringify({
      not: "a",
      note: false,
    }),
  });

  expect(updateResult).toMatchObject({ statusCode: 422 });
});

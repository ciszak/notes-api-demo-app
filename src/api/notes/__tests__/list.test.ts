import { generateEvent } from "./test-utils";

import { Note } from "../schema";

import { handler as createHandler } from "../create";
import { handler as listHandler } from "../list";

test("returns empty array when no notes are saved", async () => {
  const listResult = await listHandler(generateEvent());
  const parsedResult = JSON.parse(listResult.body!);

  expect(parsedResult).toEqual([]);
});

test("should return notes of signed user only", async () => {
  const userOneEmptyEvent = generateEvent();
  const userTwoEmptyEvent = generateEvent();

  const userOneNote: Note = {
    title: "User one's note",
    body: "Remember the milk!",
  };

  const userTwoNote: Note = {
    title: "User two's note",
    body: "Remember the milk!",
  };

  await Promise.all([
    createHandler({
      ...userOneEmptyEvent,
      body: JSON.stringify(userOneNote),
    }),

    createHandler({
      ...userTwoEmptyEvent,
      body: JSON.stringify(userTwoNote),
    }),
  ]);

  const listResult = await listHandler(userOneEmptyEvent);
  const parsedResult = JSON.parse(listResult.body!);

  expect(parsedResult).toMatchObject([userOneNote]);
  expect(parsedResult).not.toMatchObject([userTwoNote]);
});

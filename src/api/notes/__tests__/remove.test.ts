import { generateEvent } from "./test-utils";

import { Note } from "../schema";

import { handler as createHandler } from "../create";
import { handler as listHandler } from "../list";
import { handler as removeHandler } from "../remove";

test("removes a note", async () => {
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

  const removeResult = await removeHandler({
    ...userOneEmptyEvent,
    pathParameters: { id },
  });

  expect(removeResult).toMatchObject({ statusCode: 204 });

  const listAfterDeleteResult = await listHandler(userOneEmptyEvent);
  const parsedListAfterDeleteResultResult = JSON.parse(
    listAfterDeleteResult.body!
  );

  expect(parsedListAfterDeleteResultResult).toEqual([]);
});

test("returns success on call to non-existent item", async () => {
  const removeResult = await removeHandler(
    generateEvent({
      pathParameters: { id: "non-existent" },
    })
  );

  expect(removeResult).toMatchObject({ statusCode: 204 });
});

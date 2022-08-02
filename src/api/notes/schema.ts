import { z } from "zod";

export const noteSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1),
  body: z.string(),
});

export type Note = z.infer<typeof noteSchema>;

export const convertToApiFormat = (note?: object) => {
  return noteSchema.parse(note);
};

import { z } from "zod"

export const postSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),

  brandSlug: z.string().optional(),
  designerSlug: z.string().optional(),

  year: z.string().optional(),
  seasonType: z.enum(["ss", "fw", ""]).optional(),

  imageUrls: z.array(z.string()).min(1),
  selectedTags: z.array(z.string()).optional(),
})
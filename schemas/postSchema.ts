import { z } from "zod"

export const postSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional().nullable(),

  brandSlug: z.string().optional().nullable(),
  designerSlug: z.string().optional().nullable(),

  year: z.string().optional().nullable(),
  
  season: z.enum(["ss", "fw"]).optional().nullable(), 

  imageUrls: z.array(z.string()).min(1),
  selectedTags: z.array(z.string()).optional(),
})
import z from 'zod'

export interface CreatePlaylistInputDTO {
  name: string,
  token: string
}

export type CreatePlaylistOutputDTO = undefined

export const createPlaylistSchema = z.object({
  name: z.string().min(2),
  token: z.string().min(1)
}).transform(data => data as CreatePlaylistInputDTO)
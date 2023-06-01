import z from 'zod'

export interface LIkeOrDislikePlaylistInputDTO{
PlaylistId:string,
token:string,
like:boolean
}

export type LIkeOrDislikePlaylistOutputDTO = undefined

export const LIkeOrDislikePlaylistSchema = z.object({
PlaylistId:z.string().min(1),
token:z.string().min(1),
like:z.boolean()
}).transform(data=>data as LIkeOrDislikePlaylistInputDTO)
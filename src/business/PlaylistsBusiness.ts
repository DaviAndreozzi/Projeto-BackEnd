import { PlaylistDatabase } from "../database/PlaylistDatabase";
import { CreatePlaylistInputDTO, CreatePlaylistOutputDTO } from "../dtos/playlists/createPlaylist.dto";
import { GetPlaylistsInputDTO, GetPlaylistsOutputDTO } from "../dtos/playlists/getPlaylist.dto";
import { UnauthorizedError } from "../errors/UnauthorizedError";
import { LikeDislikeDB, Playlist, Playlist_Like } from "../models/Playlists";
import { IdGenerator } from "../services/IdGenerator";
import { TokenManager } from "../services/TokenManager";
import { EditPlaylistInputDTO, EditPlaylistOutputDTO } from "../dtos/playlists/editPlaylist.dto";
import { NotFoundError } from "../errors/NotFoundError";
import { ForbiddenError } from "../errors/ForbiddenError";
import { DeletePlaylistInputDTO, DeletePlaylistOutputDTO } from "../dtos/playlists/deletePlaylist.dto";
import { USER_ROLES } from "../models/User";
import { LIkeOrDislikePlaylistInputDTO, LIkeOrDislikePlaylistOutputDTO } from "../dtos/playlists/likeOrDislikePlaylist.dto";

export class PlaylistBusiness {
  constructor(
    private playlistDatabase: PlaylistDatabase,
    private idGenerator: IdGenerator,
    private tokenManager: TokenManager,
  ) { }

  public createPlaylist = async (input: CreatePlaylistInputDTO): Promise<CreatePlaylistOutputDTO> => {
    const { name, token } = input

    const payload = this.tokenManager.getPayload(token)

    if (!payload) {
      throw new UnauthorizedError()
    }

    const id = this.idGenerator.generate()

    const playlist = new Playlist(
      id,
      name,
      0,
      0,
      new Date().toISOString(),
      new Date().toISOString(),
      payload.id,
      payload.name
    )
    const playlistDB = playlist.toDBModel()
    await this.playlistDatabase.insertPlaylist(playlistDB)

    const output: CreatePlaylistOutputDTO = undefined

    return output
  }

  public getPlaylists = async (input: GetPlaylistsInputDTO): Promise<GetPlaylistsOutputDTO> => {
    const { token } = input

    const payload = this.tokenManager.getPayload(token)

    if (!payload) {
      throw new UnauthorizedError()
    }

    const playlistsDBCreatorName = await this.playlistDatabase.getPlaylistsCreatorName()

    const playlists = playlistsDBCreatorName.map((playlistCreatorName) => {
      const playlist = new Playlist(
        playlistCreatorName.id,
        playlistCreatorName.name,
        playlistCreatorName.likes,
        playlistCreatorName.dislikes,
        playlistCreatorName.created_at,
        playlistCreatorName.updated_at,
        playlistCreatorName.creator_id,
        playlistCreatorName.creator_name
      )
      return playlist.toBusinessModel()
    })

    const output: GetPlaylistsOutputDTO = playlists

    return output

  }

  public editPlaylist = async (input: EditPlaylistInputDTO): Promise<EditPlaylistOutputDTO> => {
    const { name, token, idToEdit } = input

    const payload = this.tokenManager.getPayload(token)

    if (!payload) {
      throw new UnauthorizedError()
    }

    const playlistDB = await this.playlistDatabase.findPlaylistById(idToEdit)

    if (!playlistDB) {
      throw new NotFoundError("Playlist com essa id não existe ")
    }

    if (payload.id !== playlistDB.creator_id) {
      throw new ForbiddenError("somente quem criou a playlist pode editá-la")
    }

    const playlist = new Playlist(
      playlistDB.id,
      playlistDB.name,
      playlistDB.likes,
      playlistDB.dislikes,
      playlistDB.created_at,
      playlistDB.updated_at,
      playlistDB.creator_id,
      payload.name
    )

    playlist.setName(name)

    const updatedPlaylistDB = playlist.toDBModel()

    await this.playlistDatabase.updatePlaylist(updatedPlaylistDB)


    const output: EditPlaylistOutputDTO = undefined

    return output
  }

  public deletePlaylist = async (input: DeletePlaylistInputDTO): Promise<DeletePlaylistOutputDTO> => {
    const { token, idToDelete } = input

    const payload = this.tokenManager.getPayload(token)

    if (!payload) {
      throw new UnauthorizedError()
    }

    const playlistDB = await this.playlistDatabase.findPlaylistById(idToDelete)

    if (!playlistDB) {
      throw new NotFoundError("Playlist com essa id não existe ")
    }

    if (payload.role !== USER_ROLES.ADMIN) {
      if (payload.id !== playlistDB.creator_id) {
        throw new ForbiddenError("somente quem criou a playlist pode editá-la")
      }
    }



    await this.playlistDatabase.deletePlaylistById(idToDelete)


    const output: DeletePlaylistOutputDTO = undefined

    return output
  }

  public likeOrDislikePlaylist = async (input: LIkeOrDislikePlaylistInputDTO): Promise<LIkeOrDislikePlaylistOutputDTO> => {
    const { token, like, PlaylistId } = input

    const payload = this.tokenManager.getPayload(token)

    if (!payload) {
      throw new UnauthorizedError()
    }

    const PlaylistDBCreatorName = await this.playlistDatabase.findPlaylistCreatorDBById(PlaylistId)

    if (!PlaylistDBCreatorName) {
      throw new NotFoundError("playlist com essa id não existe")
    }

    const playlist = new Playlist(
      PlaylistDBCreatorName.id,
      PlaylistDBCreatorName.name,
      PlaylistDBCreatorName.likes,
      PlaylistDBCreatorName.dislikes,
      PlaylistDBCreatorName.created_at,
      PlaylistDBCreatorName.updated_at,
      PlaylistDBCreatorName.creator_id,
      PlaylistDBCreatorName.creator_name
    )

    const likeSQlite = like ? 1 : 0

    const likeDislikeDB: LikeDislikeDB = {
      user_id: payload.id,
      playlist_id: PlaylistId,
      like: likeSQlite
    }

    const likeDislikeExists = await this.playlistDatabase.findLikeDislike(likeDislikeDB)

    if (likeDislikeExists == Playlist_Like.ALREADY_LIKED) {
      if (like) {
        await this.playlistDatabase.removeLIkeDislike(likeDislikeDB)
        playlist.removeLike()
      } else {
        await this.playlistDatabase.updateLikeDislike(likeDislikeDB)
        playlist.removeLike()
        playlist.addDislike()
      }
    } else if (likeDislikeExists === Playlist_Like.ALREADY_DISLIKE) {
      if (like === false) {
        await this.playlistDatabase.removeLIkeDislike(likeDislikeDB)
        playlist.removeDislike()
      } else {
        await this.playlistDatabase.updateLikeDislike(likeDislikeDB)
        playlist.removeDislike()
        playlist.addDislike()
      }
    } else {
      await this.playlistDatabase.insertLikeDislike(likeDislikeDB)
      like ? playlist.addLike() : playlist.addDislike()
    }
    const updatePlaylistDB = playlist.toDBModel()
    await this.playlistDatabase.updatePlaylist(updatePlaylistDB)

    const output: LIkeOrDislikePlaylistOutputDTO = undefined

    return output
  }

}

export interface PlaylistDB {
  id: string,
  creator_id: string,
  name: string,
  likes: number,
  dislikes: number,
  created_at: string,
  updated_at: string
}

export interface PlaylistDBCreatorName {
  id: string,
  creator_id: string,
  name: string,
  likes: number,
  dislikes: number,
  created_at: string,
  updated_at: string,
  creator_name: string,
}

export interface PlaylistModel {
  id: string,
  name: string,
  likes: number,
  dislikes: number,
  created_at: string,
  updated_at: string,
  creator: {
    id: string,
    name: string
  }
}


export interface LikeDislikeDB {
  user_id: string,
  playlist_id: string,
  like: number
}

export enum Playlist_Like {
  ALREADY_LIKED = "ALREADY LIKED",
  ALREADY_DISLIKE = "ALERADY DISLIKE"
}

export class Playlist {
  constructor(
    private id: string,
    private name: string,
    private likes: number,
    private dislikes: number,
    private createdAt: string,
    private updatedAt: string,
    private creatorId: string,
    private creatorName: string
  ) { }

  public getId(): string {
    return this.id
  }

  public getName(): string {
    return this.name
  }

  public getLikes(): number {
    return this.likes
  }

  public getDislikes(): number {
    return this.dislikes
  }

  public getCreateAt(): string {
    return this.createdAt
  }

  public getUpdatedAT(): string {
    return this.updatedAt
  }

  public getCreatorId(): string {
    return this.creatorId
  }

  public getCreatorName(): string {
    return this.creatorName
  }

  public setId(value: string): void {
    this.id = value
  }

  public setName(value: string): void {
    this.name = value
  }

  public setLikes(value: number): void {
    this.likes = value
  }

  public addLike = (): void => {
    this.likes++
  }

  public removeLike = () => {
    this.likes--
  }

  public setDislikes(value: number): void {
    this.dislikes = value
  }

  public addDislike = (): void => {
    this.dislikes++
  }

  public removeDislike = (): void => {
    this.dislikes--
  }

  public setCreatedAt(value: string): void {
    this.createdAt = value
  }

  public setUpdatedAt(value: string): void {
    this.updatedAt = value
  }

  public setCreatorId(value: string): void {
    this.creatorId = value
  }

  public setCreatorName(value: string): void {
    this.creatorName = value
  }

  public toDBModel(): PlaylistDB {
    return {
      id: this.id,
      creator_id: this.creatorId,
      name: this.name,
      likes: this.likes,
      dislikes: this.dislikes,
      created_at: this.createdAt,
      updated_at: this.updatedAt
    }
  }

  public toBusinessModel(): PlaylistModel {
    return {
      id: this.id,
      name: this.name,
      likes: this.likes,
      dislikes: this.dislikes,
      created_at: this.createdAt,
      updated_at: this.updatedAt,
      creator: {
        id: this.creatorId,
        name: this.creatorName
      }
    }
  }

}
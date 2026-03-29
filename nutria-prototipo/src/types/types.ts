export interface Post {
  id: string;
  username: string;
  userImage: string;
  postImage: string;
  streak: number;
  likes: number;
  caption: string;
  isLiked: boolean;
}

export interface Story {
  id: string;
  username: string;
  image: string;
}
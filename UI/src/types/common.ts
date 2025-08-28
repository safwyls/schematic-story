import dayjs from "dayjs";

export interface ShortUser {
    id: string;
    username: string;
    email: string;
    timezone: string;
    avatarUrl: string;
    preferred_username: string;
}

export interface SchematicProps {
    id: string | undefined;
}

export interface Details {
    title: string;
    author: string;
    contributors: string[];
    buildSize: string;
    submittedAt: string;
    updatedAt: string;
    follows: number;
    downloads: number;
    description: any[];
    tags: string[];
    images: any[];
    dimensions: Vec3d;
    fileSize: number;
}

export interface Vec3d {
    x: number;
    y: number;
    z: number;
}

export interface ExpandedUser {
  id: string;
  username: string;
  preferred_username: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
  joinedAt: string;
  followersCount: number;
  followingCount: number;
  schematicsCount: number;
  isFollowing?: boolean;
}

export interface Schematic {
  id: string;
  title: string;
  description: string;
  coverImageUrl?: string;
  author: string;
  createdAt: string;
  downloadCount: number;
  tags: string[];
}

export interface Comment {
  id: string;
  content: string;
  schematicId: string;
  schematicTitle: string;
  createdAt: string;
}
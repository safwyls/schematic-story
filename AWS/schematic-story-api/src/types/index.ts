export interface User {
  userId: string;
  username: string;
  email: string;
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  status: 'active' | 'deleted';
  createdAt: string;
  updatedAt: string;
}

export interface Schematic {
  schematicId: string;
  title: string;
  description: string;
  authorId: string;
  authorUsername: string;
  tags: string[];
  status: 'active' | 'deleted';
  version: number;
  fileUrl?: string;
  coverImageUrl?: string;
  dimensions?: {
    width: number;
    height: number;
    depth: number;
  };
  blockCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  commentId: string;
  schematicId: string;
  authorId: string;
  authorUsername: string;
  content: string;
  status: 'active' | 'deleted' | 'edited';
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  count: number;
  nextToken?: string;
}
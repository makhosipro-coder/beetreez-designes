export type TeamMemberRole = 'admin' | 'editor' | 'viewer';

export interface TeamMember {
  userId: string;
  email: string;
  name: string;
  role: TeamMemberRole;
  joinedAt: number;
}

export interface Team {
  id: string;
  name: string;
  ownerId: string;
  members: TeamMember[];
  createdAt: number;
  updatedAt: number;
}

export interface CursorPosition {
  userId: string;
  name: string;
  color: string;
  x: number;
  y: number;
  updatedAt: number;
}

export interface CollabState {
  designId: string;
  cursors: Record<string, CursorPosition>;
}

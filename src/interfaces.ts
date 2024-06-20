export interface User {
  id?: number;
  username: string;
  password: string;
}

export interface Post {
  id?: number;
  title: string;
  content: string;
  created_by: string;
  updated_by?: string;
  created_at?: Date;
  updated_at?: Date;
  is_deleted?: boolean;
}

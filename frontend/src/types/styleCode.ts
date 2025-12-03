export interface StyleCode {
  id: number;
  code: string;
  name?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StyleCodeFormData {
  code: string;
  name?: string;
  active?: boolean;
}

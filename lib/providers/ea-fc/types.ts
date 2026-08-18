export interface FutGgSbc {
  id: number;

  name: string;

  endTime: string;

  isRepeatable: boolean;
}

export interface FutGgSbcListResponse {
  currentPage: number;

  next: string | null;

  totalPages: number;

  data: FutGgSbc[];
}

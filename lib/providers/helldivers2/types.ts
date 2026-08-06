export interface Helldivers2Assignment {
  id: number;

  title: string | null;

  briefing: string | null;

  description: string | null;

  expiration: string;
}

export type Helldivers2AssignmentsResponse = Helldivers2Assignment[];

export interface Game {
  id: string;
  name: string;
  slug: string;
  logo: string;
  color: string;

  shortName: string;

  supportedEvents: number;

  activeUsers: string;

  featured: boolean;
}
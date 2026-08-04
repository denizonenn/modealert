export interface ValorantPlatformStatusResponse {
  id: string;

  maintenances: unknown[];

  incidents: unknown[];
}

export interface ValorantAct {
  id: string;

  parentId: string;

  type: string;

  name: string;

  localizedNames?: Record<
    string,
    string
  >;

  isActive: boolean;
}

export interface ValorantContentResponse {
  acts: ValorantAct[];
}

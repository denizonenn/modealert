export interface Ps2WorldEvent {
  metagame_event_id: string;
  metagame_event_state_name: string;
  timestamp: string;
  zone_id: string;
  instance_id: string;
}

export interface Ps2WorldEventResponse {
  world_event_list?: Ps2WorldEvent[];
}

export interface Ps2MetagameEventDefinition {
  metagame_event_id: string;
  name: { en: string };
  duration_minutes?: string;
}

export interface Ps2MetagameEventDefinitionResponse {
  metagame_event_list: Ps2MetagameEventDefinition[];
}

export interface Ps2Zone {
  zone_id: string;
  name: { en: string };
}

export interface Ps2ZoneResponse {
  zone_list: Ps2Zone[];
}

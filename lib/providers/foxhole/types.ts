export interface FoxholeWarState {
  warId: string;

  warNumber: number;

  winner: "NONE" | "COLONIALS" | "WARDENS";

  conquestStartTime: number;

  conquestEndTime: number | null;

  resistanceStartTime: number | null;

  scheduledConquestEndTime: number | null;

  requiredVictoryTowns: number;
}

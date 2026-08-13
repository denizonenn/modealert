import {
  createEventChange,
  getChangesByEvent,
  type CreateEventChangeInput,
} from "@/lib/repositories/event-change.repository";

export const eventChangeService = {
  async record(input: CreateEventChangeInput) {
    return createEventChange(input);
  },

  async getByEvent(eventId: string) {
    return getChangesByEvent(eventId);
  },
};

import {
  COMMUNITY_DRAGON,
} from "./constants";

class CommunityDragonClient {
  async get<T>(
    endpoint: string
  ): Promise<T> {
    const response =
      await fetch(
        `${COMMUNITY_DRAGON.BASE_URL}${endpoint}`,
        {
          signal:
            AbortSignal.timeout(
              COMMUNITY_DRAGON.TIMEOUT
            ),
        }
      );

    if (!response.ok) {
      throw new Error(
        `CommunityDragon request failed (${response.status})`
      );
    }

    return response.json();
  }
}

export const communityDragonClient =
  new CommunityDragonClient();
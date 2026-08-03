import {
  communityDragonClient,
} from "./client";

export const communityDragonService = {
  async debug() {
    const paths = [
      "/plugins/rcp-be-lol-game-data/global/default/v1/",
    ];

    for (const path of paths) {
      console.log("");
      console.log("====================================");
      console.log(path);
      console.log("====================================");

      try {
        const response =
          await fetch(
            `https://raw.communitydragon.org/latest${path}`
          );

        console.log(
          "STATUS:",
          response.status
        );

        const text =
          await response.text();

        console.log(text);

        const keywords = [
          "event",
          "mission",
          "shop",
          "pass",
          "token",
          "loot",
          "urf",
          "arena",
          "clash",
          "mode",
          "rotation",
          "hub",
        ];

        console.log("");

        for (const keyword of keywords) {
          if (
            text
              .toLowerCase()
              .includes(keyword)
          ) {
            console.log(
              `FOUND: ${keyword}`
            );
          }
        }
      } catch (error) {
        console.error(error);
      }
    }
  },
};
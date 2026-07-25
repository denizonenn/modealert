export interface Game {

  id: string

  name: string

  shortName: string

  logo: string

  color: string

  supportedEvents: number

  activeUsers: string

}

export const games: Game[] = [

  {

    id: "lol",

    name: "League of Legends",

    shortName: "LoL",

    logo: "🎮",

    color: "#5383EC",

    supportedEvents: 8,

    activeUsers: "12.8k"

  },

  {

    id: "valorant",

    name: "Valorant",

    shortName: "VAL",

    logo: "🎯",

    color: "#FF4655",

    supportedEvents: 4,

    activeUsers: "8.4k"

  },

  {

    id: "tft",

    name: "Teamfight Tactics",

    shortName: "TFT",

    logo: "♟️",

    color: "#D9A441",

    supportedEvents: 5,

    activeUsers: "4.2k"

  },

  {

    id: "fortnite",

    name: "Fortnite",

    shortName: "FN",

    logo: "🏝️",

    color: "#4DD0E1",

    supportedEvents: 6,

    activeUsers: "9.1k"

  },

  {

    id: "apex",

    name: "Apex Legends",

    shortName: "Apex",

    logo: "🛡️",

    color: "#FF7043",

    supportedEvents: 3,

    activeUsers: "2.9k"

  },

  {

    id: "ow2",

    name: "Overwatch 2",

    shortName: "OW2",

    logo: "⚡",

    color: "#F28C28",

    supportedEvents: 4,

    activeUsers: "3.3k"

  }

]
export interface HeroCardData {
  id: string;
  title: string;

  background: string;
  textColor?: string;

  icon: string;

  gridColumn: string;
  gridRow: string;

  rotate?: number;
  scale?: number;

  iconWidth?: string;
}

export interface HeroProfile {
  name: string;
  username: string;
  verified: boolean;

  image: string;

  description: string;
}

export const profile: HeroProfile = {
  name: "Moisés Baldenegro Melendez",

  username: "@moibaldenegro",

  verified: true,

  image: "assets/moises-hero.jpg",

  description:
    "AI Engineering • Rust • WebAssembly • Full Stack • DevOps • AWS • Azure • Security First • OWASP • Rustacean 🦀"
};

export const heroCards: HeroCardData[] = [

  {
    id: "react",

    title: "REACT",

    background: "#0E6C82",

    icon: "/assets/svg/sprite.svg#react",

    gridColumn: "6 / span 5",

    gridRow: "1 / span 2",

    rotate: -8,

    scale: 1.12,

    iconWidth: "165px"
  },

  {
    id: "html",

    title: "HTML",

    background: "#B74D05",

    icon: "/assets/svg/sprite.svg#html",

    gridColumn: "11 / span 2",

    gridRow: "1 / span 2",

    rotate: -7,

    scale: .95,

    iconWidth: "115px"
  },

  {
    id: "node",

    title: "NODE JS",

    background: "#08783A",

    icon: "/assets/svg/sprite.svg#node",

    gridColumn: "6 / span 2",

    gridRow: "3 / span 2",

    rotate: -10,

    scale: 1,

    iconWidth: "120px"
  },

  {
    id: "github",

    title: "GITHUB ACTIONS",

    background: "#091223",

    icon: "/assets/svg/sprite.svg#github",

    gridColumn: "8 / span 5",

    gridRow: "3 / span 2",

    rotate: -12,

    scale: 1.15,

    iconWidth: "190px"
  },

  {
    id: "youtube",

    title: "YOUTUBE",

    background: "#B61111",

    icon: "/assets/svg/sprite.svg#youtube",

    gridColumn: "6 / span 5",

    gridRow: "5 / span 2",

    rotate: -8,

    scale: 1,

    iconWidth: "170px"
  },

  {
    id: "twitch",

    title: "TWITCH",

    background: "#6C20B6",

    icon: "/assets/svg/sprite.svg#twitch",

    gridColumn: "11 / span 2",

    gridRow: "5 / span 2",

    rotate: -8,

    scale: 1,

    iconWidth: "115px"
  },

  {
    id: "typescript",

    title: "TYPESCRIPT",

    background: "#215BC7",

    icon: "/assets/svg/sprite.svg#typescript",

    gridColumn: "1 / span 2",

    gridRow: "7 / span 2",

    rotate: -10,

    scale: 1,

    iconWidth: "110px"
  },

  {
    id: "css",

    title: "CSS",

    background: "#6E29C8",

    icon: "/assets/svg/sprite.svg#css",

    gridColumn: "3 / span 2",

    gridRow: "7 / span 2",

    rotate: -8,

    scale: 1,

    iconWidth: "105px"
  },

  {
    id: "node-bottom",

    title: "NODE JS",

    background: "#0A7C39",

    icon: "/assets/svg/sprite.svg#node",

    gridColumn: "5 / span 2",

    gridRow: "7 / span 2",

    rotate: -6,

    scale: 1,

    iconWidth: "120px"
  },

  {
    id: "github-bottom",

    title: "GITHUB ACTIONS",

    background: "#202A3A",

    icon: "/assets/svg/sprite.svg#github",

    gridColumn: "7 / span 4",

    gridRow: "7 / span 2",

    rotate: 0,

    scale: 1.08,

    iconWidth: "165px"
  },

  {
    id: "youtube-bottom",

    title: "YOUTUBE",

    background: "#BF1616",

    icon: "/assets/svg/sprite.svg#youtube",

    gridColumn: "11 / span 2",

    gridRow: "7 / span 2",

    rotate: -5,

    scale: 1,

    iconWidth: "120px"
  },

  {
    id: "twitch-bottom",

    title: "TWITCH",

    background: "#7B29D6",

    icon: "/assets/svg/sprite.svg#twitch",

    gridColumn: "1 / span 8",

    gridRow: "9 / span 2",

    rotate: -6,

    scale: 1,

    iconWidth: "170px"
  }

];
export const TIMEZONE = process.env.TZ || "America/New_York";
export const MEETING_WEEKDAY = 4; // Thursday (Luxon: Monday = 1)
export const MEETING_HOUR = 5;
export const MEETING_MINUTE = 0;

export const PEOPLE = {
  Jessica: {
    name: "Jessica",
    email: "otchague83@yahoo.fr",
  },
  Gianina: {
    name: "Gianina",
    email: "otchague@gmail.com",
  },
  Eric: {
    name: "Eric",
    email: "yalshire2004@gmail.com",
  },
};

export const ROTATION = ["Jessica", "Gianina", "Eric"];

export const VERSE = {
  text: "Commit your work to the Lord, and your plans will be established.",
  reference: "Proverbs 16:3",
  french:
    "Recommande à l'Éternel tes œuvres, et tes projets réussiront.",
};

export const RECIPIENTS = Object.values(PEOPLE).map((person) => person.email);
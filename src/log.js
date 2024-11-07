import kleur from "kleur";

export const log = {
  info: (x) => console.log(kleur.blue().bold(x)),
  error: (x) => console.log(kleur.red().bold(x)),
  warn: (x) => console.log(kleur.yellow().bold(x)),
};

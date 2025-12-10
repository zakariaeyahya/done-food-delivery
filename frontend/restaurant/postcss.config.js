// postcss.config.js
export default {
  plugins: {
    // Permet d'utiliser @import dans tes fichiers CSS
    // Décommenter si postcss-import est installé: npm i -D postcss-import
    // "postcss-import": {},

    // Nesting natif compatible Tailwind
    "tailwindcss/nesting": {},

    // Tailwind
    tailwindcss: {},

    // Ajoute les préfixes navigateurs automatiquement
    autoprefixer: {},
  },
};

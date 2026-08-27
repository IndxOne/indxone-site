module.exports = {
  plugins: {
    'postcss-import': {},
    autoprefixer: {},
    '@fullhuman/postcss-purgecss': {
      content: [
        './*.html',
        './*.js',
        './_includes/*.html',
        './merci/*.html',
        './accessibilite/*.html',
        './collectivites/*.html',
        './projets/*.html',
        './votre-idee/*.html',
      ],
      safelist: {
        standard: [
          /^hljs-/,
          /^languages-/,
          /^language-/,
          /^reveal/,
          /^in/,
          /^active/,
          /^dark/,
          /^light/,
          /^data-theme/,
          'data-theme'
        ]
      }
    },
    cssnano: {
      preset: 'default'
    }
  }
};

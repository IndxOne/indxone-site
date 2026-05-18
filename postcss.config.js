module.exports = {
  plugins: {
    'postcss-import': {},
    autoprefixer: {},
    '@fullhuman/postcss-purgecss': {
      content: [
        './*.html',
        './*.js',
        './collectivites/*.html',
        './projets/*.html',
        './en/*.html',
        './en/**/*.html'
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

module.exports = {
  plugins: {
    autoprefixer: {},
    '@fullhuman/postcss-purgecss': {
      content: [
        './**/*.html',
        './**/*.js'
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

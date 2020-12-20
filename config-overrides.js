module.exports = (config) => {
  config.module.rules.push({
      test: /\.(js|mjs|jsx|ts|tsx)$/,
      use: [
          {
              loader: 'astroturf/loader',
              options: { extension: '.module.css' },
          },
      ],
  });
  return config;
};

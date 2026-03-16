"use strict";

// Exclui node_modules do source-map-loader para evitar ENOENT com @mui/icons-material no Windows
module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      const rules = webpackConfig.module.rules;
      if (Array.isArray(rules)) {
        rules.forEach((rule) => {
          if (rule.oneOf && Array.isArray(rule.oneOf)) {
            rule.oneOf.forEach((one) => {
              if (one.use && Array.isArray(one.use)) {
                one.use.forEach((u) => {
                  if (u.loader && typeof u.loader === "string" && u.loader.includes("source-map-loader")) {
                    one.exclude = [/node_modules/].concat(one.exclude || []);
                  }
                });
              }
            });
          }
        });
      }
      return webpackConfig;
    },
  },
};

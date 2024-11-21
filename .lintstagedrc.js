module.exports = {
  // '*.{ts}': ['nx affected:lint --fix'],
  '*.{ts,js,html,json,scss,css,md,yaml,yml}': [
    'nx format:write --base=main --head=HEAD',
  ],
};

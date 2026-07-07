// Automated versioning via semantic-release, driven by Conventional Commits.
// A `fix:` cuts a patch, `feat:` a minor, and a `BREAKING CHANGE:` footer a
// major. `chore:`/`docs:`/`ci:`/`test:` do not release. On a push to main the
// CI `release` job runs this: it computes the next version, bumps package.json
// (npmPublish is off — this is a deployed web app, not an npm package), writes
// changelog.md, commits them with [skip ci], tags, and opens a GitHub release.
module.exports = {
  branches: ['main'],
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    ['@semantic-release/npm', { npmPublish: false }],
    ['@semantic-release/changelog', { changelogFile: 'changelog.md' }],
    [
      '@semantic-release/git',
      {
        assets: ['changelog.md', 'package.json', 'package-lock.json'],
        message: 'chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}',
      },
    ],
    ['@semantic-release/github', { failComment: false, failTitle: false }],
  ],
};

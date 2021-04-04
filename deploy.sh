#!/usr/bin/env bash
git checkout -b deploy
npm run build
git add -f build
git commit -m 'deploy'
git push heroku deploy:main
git checkout main
git branch -D deploy
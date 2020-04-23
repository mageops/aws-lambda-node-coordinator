FROM node:12-alpine

RUN apk add --no-cache zip

VOLUME /workdir
WORKDIR /workdir

ENTRYPOINT set -ex && yarn install \
    && rm -rf dist \
    && yarn build \
    && rm -rf node_modules \
    && yarn install --prod \
    && mv node_modules dist/node_modules \
    && (cd dist && zip -r9 /tmp/lambda-$$.zip *) \
    && rm dist -rf \
    && mkdir -p dist \
    && mv /tmp/lambda-$$.zip dist/lambda.zip

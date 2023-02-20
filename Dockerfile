FROM node:alpine3.17 as build-ui

WORKDIR /app

ADD dashboard .

RUN npm i --verobose
ENV NODE_ENV=production
ENV VITE_API_URL="/_/api"
RUN npm run build-only


FROM denoland/deno:alpine-1.30.0

WORKDIR /app

ADD server .

# Compile the main app so that it doesn't need to be compiled each startup/entry.
COPY --from=build-ui /app/dist /app/dashboard
COPY prefabs /app/

RUN deno compile --allow-sys \ 
    --allow-net \ 
    --allow-read \ 
    --allow-write \
    --allow-run \
    --allow-env \
    --output mimic \
    src/main.ts

ENTRYPOINT [ "./mimic" ]
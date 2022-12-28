FROM node:alpine3.17 as build-ui

WORKDIR /app

ADD dashboard .

RUN npm i --verobose
RUN npm run build-only


FROM denoland/deno:1.29.1

# The port that your application listens to.
EXPOSE 8080

WORKDIR /app

# Prefer not to run as root.
USER deno

# Cache the dependencies as a layer (the following two steps are re-run only when deps.ts is modified).
# Ideally cache deps.ts will download and compile _all_ external files used in main.ts.
# COPY server/src/deps.ts .
# RUN deno cache deps.ts

# These steps will be re-run upon each file change in your working directory:
ADD server .
# Compile the main app so that it doesn't need to be compiled each startup/entry.
RUN deno cache src/main.ts

COPY --from=build-ui /app/dist /app/dashboard

CMD ["run", "--allow-net", "--allow-read", "src/main.ts"]
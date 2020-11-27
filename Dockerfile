FROM node:12

COPY . /app

EXPOSE 5000

CMD ['node', '/app/build/app.js']
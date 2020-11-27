FROM node:12

WORKDIR /app
COPY . .

EXPOSE 5000

CMD ["node", "/app/build/app.js"]
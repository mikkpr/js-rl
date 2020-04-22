FROM tarampampam/node:13-alpine
RUN apk --no-cache add git
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY package.json /app/package.json
RUN npm install
CMD ["npm", "start"]

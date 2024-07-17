FROM node:20
WORKDIR /user/src/app
COPY package*.json ./
RUN npm install
RUN npm install -g typescript
COPY . .
RUN npm run build
EXPOSE 5001
CMD ["npm", "start"]
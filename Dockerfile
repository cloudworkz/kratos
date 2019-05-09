FROM node:11
RUN yarn global add kratos
ADD bin/docker.json /opt/docker.json
ENV NODE_NO_WARNINGS 1
ENV NODE_ENV production
CMD ["kratos", "-p", "1918", "-l", "/opt/docker.json"]

FROM node:15.13
RUN sudo apt update -y && sudo apt upgrade -y
RUN apt install sqlite3
# Setup
### Install packages
``
npm install
``


### Environtment Variable
``
cp .env.example .env
``

Open .env file, then modify its content accordingly


# Dev
### How to run
``
npm run watch 
``

# Prod
### Install Additional Library
``
npm install -g pm2 pm2-windows-startup
``

``
pm2 install pm2-logrotate
``

``
pm2-startup install
``

### Prepare logging
#### configure log file rotation (default set rotate as every day)
``
pm2 set pm2-logrotate:rotateInterval '0 0 * * *'
``
### Prepare Auto Start Up API
#### Run API
``
npm run start
``
#### Save PM2 List
``
pm2 save
``

### Maintain API
#### start
``
npm run start
``
#### stop
``
npm run stop
``
#### restart
``
npm run restart
``
#### Check Status API
``
pm2 list
``
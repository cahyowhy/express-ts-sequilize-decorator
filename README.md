# Express TS, Sequilize, Facade, Controller Decorator Pattern
Example Express with typescript. Using Eslint with AirBnb config, JWT with refresh & access token, Facade design pattern , Sequilize orm, Ajv, Winston logger and use annotation on controller. Also built in with db seeder

## Setup
1. Clone this repo
2. do `npm install`
3. copy `.env.example` to `.env` and fill `.env` with valid value
4. prepare the database on your local machine
5. run `npm run dev` to run on your local
6. run `npm run build` to deploy this app

## Incase of migration
1. copy `database.example.json` to `database.json` and fill based on `.env` value
2. install `db-migrate` & `db-migrate-pg` on your local-machine `npm i -g db-migrate && npm i -g db-migrate-pg`
3. more information visit [this](https://db-migrate.readthedocs.io/)
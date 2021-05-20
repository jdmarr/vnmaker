# VNMAKER

VNMaker is a web app for creating slide shows and visual novels.

It is currently deployed at https://jdmarr-vnmaker.herokuapp.com/

### LOCAL DEPLOYMENT

For local deployment, follow these steps:

1. Create a mysql database and set up the tables. See table-def.txt for the SQL commands to create the tables.

2. Set up OAuth apps in Google and/or Github.
   - https://console.cloud.google.com/apis/dashboard
   - https://github.com/settings/developers

3. Edit dotenv-template with the MySQL database info, and the Google/Github OAuth ID/Secret.

4. Then in the terminal:
```md
cp dotenv-template .env
npm install
node app.js
```

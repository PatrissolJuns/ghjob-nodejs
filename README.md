# GhJob Backend

This is the backend of [GhJob](https://github.com/PatrissolJuns/ghjob).

Written in nodejs, it enables additional services other than [Github jobs API](http://jobs.github.com) such as **push notifications**, **Data projection**, **Small size of pagination** and much more.

You can get the android app on play store
[![Google play logo](https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png)](https://play.google.com/store/apps/details?id=com.ghjob)

## Installation

Clone the project and install every thing with
```
yarn install
```
After that, create `.env` file by copying it from `.env.example` and fill it with your values

Now, you can run the `server.js` file with ```node server.js``` or ```nodemon server.js```

You can even make it more easy with `pm2` so that it'll be launched at boot start
```pm2 start server.config.js```

**Note**: Feel free to change the configuration of pm2 as you wish.

But before you play with API, you need to fill in the database and to do so, run the following script:
```
node populate.js
```
It will fetch all data from Github jobs API and save them into database

## Notifications

The file `notification.js` is a script to constantly notify registered devices about new jobs.
For it to be up-to-date, it needs to be handled by a cron service.
Example of running it each 5 minutes:

```
*/5 * * * * node /var/www/html/ghjob-nodejs/notification.js >> /var/log/ghjob-nodejs/cron.log
```

## Contributing

Feel free to submit issues or pull requests.

## License

The app is released under the MIT licence. For more information see `LICENSE`.

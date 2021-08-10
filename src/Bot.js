const {Client} = require('discord.js');
const Database = require('./Database');
const util = require('./util');
const fs = require('fs').promises;
const config = require('../config.json');
const Monitor = require('./Monitor');

class Bot {
    static instance = new Bot();

    static getInstance() {
        return this.instance;
    }

    /**
     * @type {Client}
     */
    #client;

    /**
     * @type {Database}
     */
    #database;

    /**
     * @type {Monitor}
     */
    #monitor = Monitor.getInstance();

    constructor() {
        this.#client = new Client({
            intents: [
                'GUILDS',
                'GUILD_MEMBERS',
                'GUILD_BANS',
                'GUILD_MESSAGES',
                'GUILD_MESSAGE_REACTIONS'
            ],
            allowedMentions: {
                parse: ['roles', 'users']
            },
            presence: { status: 'dnd', activities: [{ type: 'WATCHING', name: 'you' }] },
            partials: ['GUILD_MEMBER'],
        });

        this.#database = new Database(config.db);
    }

    async start(){
        await this.#monitor.notice('Starting modbot');
        await this.#database.waitForConnection();
        await this.#monitor.info('Connected to database!');
        console.log('Connected!');

        await this.#database.createTables();
        util.init(this.#database, this.#client);

        await this.#client.login(config.auth_token);
        await this.#monitor.info('Logged into Discord');

        await this._loadChecks();
        await this._loadFeatures();
    }

    async _loadChecks(){
        for (let file of await fs.readdir(`${__dirname}/checks`)) {
            let path = `${__dirname}/checks/${file}`;
            if (!file.endsWith('.js') || !(await fs.lstat(path)).isFile()) {
                continue;
            }

            let check;
            try {
                check = require(path);
            }
            catch (e) {
                await this.#monitor.critical(`Failed to load check '${file}'`, e);
                console.error(`Failed to load check '${file}'`, e);
                continue;
            }

            try {
                check.check(this.#database, this.#client);
                setInterval(check.check, check.interval * 1000, this.#database, this.#client);
            } catch (e) {
                await this.#monitor.error(`Failed to execute check '${file}'`, e);
                console.error(`Failed to execute check '${file}'`, e);
            }
        }
    }

    async _loadFeatures(){
        for (let folder of await fs.readdir(`${__dirname}/features`)) {
            let folderPath = `${__dirname}/features/${folder}`;
            if (!(await fs.lstat(folderPath)).isDirectory()) {
                continue;
            }
            let features = [];
            for (let file of await fs.readdir(folderPath)) {
                let path = `${__dirname}/features/${folder}/${file}`;
                if (!file.endsWith('.js') || !(await fs.lstat(path)).isFile()) {
                    continue;
                }
                try {
                    features.push(require(path));
                } catch (e) {
                    await this.#monitor.critical(`Failed to load feature '${folder}/${file}'`, e);
                    console.error(`Failed to load feature '${folder}/${file}'`, e);
                }
            }
            this.#client.on(folder, async (...args) => {
                for (let f of features) {
                    await Promise.resolve(f.event({database: this.#database,bot: this.#client}, ...args));
                }
            });
        }
    }
}

module.exports = Bot;

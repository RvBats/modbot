const ModerationCommand = require('../ModerationCommand');
const Member = require('../../Member');

class StrikeCommand extends ModerationCommand {

    static description = 'Strike a user';

    static usage = '<@user|id> [<@user|id…>] [<count>] [<reason>]';

    static names = ['strike', 's'];

    static userPerms = ['BAN_MEMBERS'];

    static type = {
        execute: 'strike',
        done: 'striked',
    };

    async executePunishment(target) {
        const member = new Member(target, this.message.guild);
        await member.strike(this.database, this.reason, this.message.author, this.count);
        return true;
    }

    loadInfo() {
        this.count = this.getCount();
        super.loadInfo();
    }

    getCount() {
        if (!this.args.length || !this.args[0].match(/^\d{1,5}$/)) return 1;
        return parseInt(this.args.shift());
    }
}

module.exports = StrikeCommand;

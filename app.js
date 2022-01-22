// Initialize config
require('dotenv').config();

// Initialize discord.js
const {Client, Intents} = require("discord.js");
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_INVITES] });
const trackedInvites = new Map();
var whitelisted = 0;
let roleID = "928547378200465448";

// Event emitter callbacks
client.on('ready', async () => {
	console.log(`Logged in as ${client.user.tag}!`);
	let guilds = await client.guilds.fetch();
		guilds.first().roles.fetch(roleID)
			.then(role => {
				whitelisted = role.members.size;
			});
});

client.on('guildMemberAdd', member => {
	trackedInvites.forEach((trackedData, code) => {
		member.guild.invites.fetch({code: code, force: true})
			.then(invite => {
				if (trackedData.uses < invite.uses) {
					trackedData.uses += 1;
					trackedData.invitees.push(member.id);
				}

				if (trackedData.uses >= 5 && whitelisted < 1111) {
					member.roles.add(roleID);
					whitelisted += 1;
				}
			});
	});
});

client.on('guildMemberRemove', member => {
	console.log(member)
});

client.on('inviteCreate', invite => {
	trackedInvites.set(invite.code, {
		owner: invite.inviterId,
		invitees: [],
		uses: 0
	});
});

client.on('inviteDelete', invite => {
	trackedInvites.delete(invite.code);
});

// Login bot
client.login('OTM0NDI2NTA4OTM4ODU0NDEw.Yev6gA.Nu9XDFej00UOVEdfxw3VUlk_XpU');
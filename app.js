const fs = require("fs/promises");

// Initialize discord.js
const {Client, Intents} = require("discord.js");
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_INVITES] });
const trackedInvites = new Map();
var whitelisted = 0;
let roleID = "928547378200465448";

// Event emitter callbacks
client.on('ready', async () => {
	console.log(`Logged in as ${client.user.tag}!`);
	console.log(`Bot ready`);

	let guilds = await client.guilds.fetch();
	let guild = await guilds.first().fetch();

	guild.roles.fetch(roleID)
		.then(role => {
			whitelisted = role.members.size;
		});
});

client.on('guildMemberAdd', member => {
	trackedInvites.forEach((trackedData, code) => {
		member.guild.invites.fetch({code: code, force: true})
			.then(invite => {
				if (trackedData.uses < invite.uses) {
					console.log(`User ${member.user.tag} joined via invite code ${code} owned by ${invite.inviter.tag}`);

					trackedData.uses += (invite.uses - trackedData.uses);
					trackedData.invitees.push(member.id);
				}

				if (trackedData.uses >= 10 && whitelisted < 1111) {
					console.log(`User ${invite.inviter.tag} was granted whitelist for inviting 10 users.`)

					member.guild.members.fetch(invite.inviterId)
						.then(inviterMember => {
							inviterMember.roles.add(roleID);
							whitelisted += 1;

							trackedInvites.delete(invite.code);
						});
				}

				SaveInvites()
					.then(() => {});
			});
	});
});

client.on('guildMemberRemove', member => {
	//console.log(member)
});

client.on('inviteCreate', invite => {
	trackedInvites.set(invite.code, {
		inviterId: invite.inviter.id,
		invitees: [],
		uses: 0
	});

	console.log(`Invite ${invite.code} created by ${invite.inviter.tag}`);

	SaveInvites()
		.then(() => {});
});

client.on('inviteDelete', invite => {
	trackedInvites.delete(invite.code);

	SaveInvites()
		.then(() => {});
});

function SaveInvites() {
	return new Promise((resolve, reject) => {
		let jsonObject = {};
		trackedInvites.forEach((value, key) => {
			jsonObject[key] = value;
		});

		fs.writeFile("./invites.json", JSON.stringify(jsonObject, null, 2))
			.then(() => {
				resolve();
			});
	});
}

function LoadInvites() {
	return new Promise((resolve, reject) => {
		fs.readFile("./invites.json", {encoding: "utf-8"})
			.then(result => {
				let jsonObject = JSON.parse(result);

				for (let key in jsonObject) {
					trackedInvites.set(key, jsonObject[key]);
				}

				resolve();
			});
	});
}

LoadInvites()
	.then(() => {
		// Login bot
		client.login('OTM0NDI2NTA4OTM4ODU0NDEw.Yev6gA.Nu9XDFej00UOVEdfxw3VUlk_XpU');
	});
const Command = require("../../lib/structures/Command");
const fetch = require("node-fetch");

class fortniteCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["fortnitestats"],
      args: "<username:string> [platform:string]",
      description: "Returns Fortnite account stats.",
      requiredkeys: ["gametracker"],
      allowdms: true,
      cooldown: 3,
    });
  }

  async run(msg, [username, platform]) {
    if (!username) return;
    // Check if the platform is valid
    if (!["psn", "xbox", "pc"].includes(platform) && platform !== undefined) {
      return msg.channel.createMessage(this.bot.embed("🤙 Fortnite", "Valid platforms are `pc`, `psn`, and `xbox`."));
    }

    // Sends the first embed
    const statmsg = await msg.channel.createMessage(this.bot.embed("🤙 Fortnite", "Waiting for a response from the Fortnite API..."));
    const body = await fetch(`https://api.fortnitetracker.com/v1/profile/${platform !== undefined ? encodeURIComponent(platform) : "pc"}/${encodeURIComponent(username)}`, {
      headers: {
        "TRN-Api-Key": this.bot.key.gametracker,
        "User-Agent": `${this.bot.user.username}/${this.bot.version}`,
      },
    }).then(async res => await res.json().catch(() => {}));

    if (!body || body.error || !body.lifeTimeStats) return await statmsg.edit(this.bot.embed("❌ Error", "No information found.", "error"));

    const fields = [];
    if (body.lifeTimeStats[8].value) fields.push({ name: "Wins", value: body.lifeTimeStats[8].value, inline: true });
    if (body.lifeTimeStats[7].value) fields.push({ name: "Matches", value: body.lifeTimeStats[7].value, inline: true });
    if (body.lifeTimeStats[10].value) fields.push({ name: "Kills", value: body.lifeTimeStats[10].value, inline: true });
    if (body.lifeTimeStats[6].value) fields.push({ name: "Score", value: body.lifeTimeStats[6].value, inline: true });
    if (body.lifeTimeStats[11].value) fields.push({ name: "K/D Ratio", value: body.lifeTimeStats[11].value, inline: true });
    if (body.lifeTimeStats[9].value) fields.push({ name: "Win Percent", value: body.lifeTimeStats[9].value, inline: true });

    statmsg.edit({
      embed: {
        title: `🤙 Fortnite stats for **${body.epicUserHandle}** on **${body.platformNameLong}**`,
        color: 0x6FC8F0,
        fields: fields,
      },
    });
  }
}

module.exports = fortniteCommand;
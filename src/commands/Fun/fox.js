const Command = require("../../lib/structures/Command");
const fetch = require("node-fetch");

class foxCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["floof", "randomfox"],
      description: "Sends a random fox picture.",
      allowdms: true,
      cooldown: 3,
    });
  }

  async run(msg) {
    const body = await fetch("https://randomfox.ca/floof/").then(async res => await res.json().catch(() => {}));
    if (!body || !body.image) return msg.channel.createMessage(this.bot.embed("❌ Error", "Couldn't send the image. Try again later."));

    await msg.channel.createMessage({
      embed: {
        title: "🦊 Floof!",
        color: this.bot.embed.color("general"),
        image: {
          url: body.image,
        },
      },
    });
  }
}

module.exports = foxCommand;
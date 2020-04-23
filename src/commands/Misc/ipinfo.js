const Command = require("../../lib/structures/Command");
const fetch = require("node-fetch");

class ipinfoCommand extends Command {
  constructor(...args) {
    super(...args, {
      args: "<ip:string>",
      aliases: ["aboutip", "geolocation", "ip", "ipinformation"],
      description: "Returns info about an IP address.",
      cooldown: 3,
    });
  }

  async run(msg, args) {
    // Fetches the API
    if (!this.bot.key.ipinfo) return msg.channel.createMessage(this.bot.embed("❌ Error", "Unauthorized - no API key provided.", "error"));
    const res = await fetch(`https://ipinfo.io/${encodeURIComponent(args.join(" "))}/json?token=${encodeURIComponent(this.bot.key.ipinfo)}`);
    const body = await res.json();

    // IPAbuseDB
    const ipdb = await fetch(`https://api.abuseipdb.com/api/v2/check?ipAddress=${encodeURIComponent(args.join(" "))}`, {
      headers: { Key: this.bot.key.abuseipdb, Accept: "application/json" },
    });

    const abuseinfo = await ipdb.json();
    if (body.error || !body.ip || !body.org) return msg.channel.createMessage(this.bot.embed("❌ Error", "Invalid IP address.", "error"));

    // Sets the fields
    const fields = [];
    if (body.hostname) fields.push({ name: "Hostname", value: body.hostname, inline: true });
    if (body.org) fields.push({ name: "Org", value: body.org, inline: true });
    if (body.loc) fields.push({ name: "Location", value: body.loc, inline: true });
    if (body.country) fields.push({ name: "Country", value: body.country, inline: true });
    if (body.city) fields.push({ name: "City", value: body.city, inline: true });
    if (body.region) fields.push({ name: "Region", value: body.region, inline: true });
    if (!abuseinfo.errors) fields.push({ name: "Abuse Info", value: `${abuseinfo.data.totalReports} reports; ${abuseinfo.data.abuseConfidenceScore}%` });

    // Sets the construct
    const construct = {
      title: `🌐 ${body.ip}`,
      description: "Information may be slightly innacurate.",
      color: this.bot.embed.colour("general"),
      fields: fields,
    };

    // Maps image
    if (body.loc && this.bot.key.maps) {
      construct.image = { url: `https://maps.googleapis.com/maps/api/staticmap?center=${body.loc}&zoom=10&size=250x150&sensor=false&key=${this.bot.key.maps}` };
    }

    // Sends the embed
    await msg.channel.createMessage({
      embed: construct,
    });
  }
}

module.exports = ipinfoCommand;
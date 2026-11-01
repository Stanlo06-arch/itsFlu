const { ActivityType } = require("discord.js");
const setupRules = require("../systems/rules");

module.exports = async (client) => {
  console.log(`✅ itsFlu ist online als ${client.user.tag}`);
  client.user.setActivity("itsFlu 💙", { type: ActivityType.Watching });

  try {
    await setupRules(client);
  } catch (error) {
    console.error("❌ Das Regelwerk konnte nicht eingerichtet werden:", error);
  }
};

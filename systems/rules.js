const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  PermissionsBitField
} = require("discord.js");
const { rulesChannelId } = require("../config/channels");

const ACCEPT_BUTTON_ID = "itsflu:accept_rules";

async function setupRules(client) {
  const channel = await client.channels.fetch(rulesChannelId);

  if (!channel || !channel.isTextBased() || !channel.guild || !channel.messages) {
    throw new Error("Der Regelkanal wurde nicht gefunden oder ist kein normaler Textkanal.");
  }

  const botMember = channel.guild.members.me;
  const required = [
    PermissionsBitField.Flags.ViewChannel,
    PermissionsBitField.Flags.SendMessages,
    PermissionsBitField.Flags.EmbedLinks,
    PermissionsBitField.Flags.ReadMessageHistory
  ];

  if (!botMember || !channel.permissionsFor(botMember)?.has(required)) {
    throw new Error("Im Regelkanal fehlen dem Bot Rechte: Kanal ansehen, Nachrichten senden, Links einbetten und Nachrichtenverlauf anzeigen.");
  }

  const embed = new EmbedBuilder()
    .setColor(0x287BFF)
    .setTitle("📜・𝐒𝐞𝐫𝐯𝐞𝐫𝐫𝐞𝐠𝐞𝐥𝐧")
    .setDescription([
      "Willkommen bei **itsFlu**! 💙",
      "Bitte lies dir unsere Regeln aufmerksam durch.",
      "",
      "**1.** Behandle alle Mitglieder respektvoll.",
      "**2.** Beleidigungen, Belästigungen und Provokationen sind nicht erlaubt.",
      "**3.** Spam und unerwünschte Werbung sind verboten.",
      "**4.** Diskriminierende oder rechtswidrige Inhalte sind verboten.",
      "**5.** Respektiere die Privatsphäre anderer Mitglieder.",
      "**6.** Folge den Anweisungen des Teams.",
      "",
      "Klicke auf **Regeln akzeptieren**, um die Mitglied-Rolle zu erhalten."
    ].join("\n"))
    .setFooter({ text: "itsFlu • Regeln gelten für alle Mitglieder" })
    .setTimestamp();

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(ACCEPT_BUTTON_ID)
      .setLabel("Regeln akzeptieren")
      .setEmoji("✅")
      .setStyle(ButtonStyle.Primary)
  );

  // Bei Neustarts wird die vorhandene Bot-Nachricht aktualisiert statt dupliziert.
  const recentMessages = await channel.messages.fetch({ limit: 100 });
  const existingMessage = recentMessages.find(message =>
    message.author.id === client.user.id &&
    message.components.some(row =>
      row.components.some(component => component.customId === ACCEPT_BUTTON_ID)
    )
  );

  if (existingMessage) {
    await existingMessage.edit({ embeds: [embed], components: [row] });
    console.log("✅ Vorhandenes Regelwerk wurde aktualisiert.");
  } else {
    await channel.send({ embeds: [embed], components: [row] });
    console.log("✅ Regelwerk wurde veröffentlicht.");
  }
}

module.exports = setupRules;
module.exports.ACCEPT_BUTTON_ID = ACCEPT_BUTTON_ID;

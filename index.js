require("dotenv").config();

const {
  Client,
  Events,
  GatewayIntentBits,
  PermissionsBitField
} = require("discord.js");
const { memberRoleId } = require("./config/channels");
const welcomeHandler = require("./guildMemberAdd");
const readyHandler = require("./events/ready");
const { ACCEPT_BUTTON_ID } = require("./systems/rules");

if (!process.env.DISCORD_TOKEN) {
  console.error("❌ DISCORD_TOKEN fehlt in den Umgebungsvariablen.");
  process.exit(1);
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers]
});

client.once(Events.ClientReady, readyHandler);
client.on(Events.GuildMemberAdd, welcomeHandler);

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isButton() || interaction.customId !== ACCEPT_BUTTON_ID) return;
  if (!interaction.inGuild()) return;

  try {
    const member = await interaction.guild.members.fetch(interaction.user.id);
    const role = await interaction.guild.roles.fetch(memberRoleId);
    const botMember = interaction.guild.members.me;

    if (!role) {
      return interaction.reply({
        content: "Die Mitglied-Rolle wurde nicht gefunden. Bitte informiere das Team.",
        ephemeral: true
      });
    }

    if (!botMember || !botMember.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
      return interaction.reply({
        content: "Dem Bot fehlt die Berechtigung „Rollen verwalten“.",
        ephemeral: true
      });
    }

    if (role.position >= botMember.roles.highest.position) {
      return interaction.reply({
        content: "Die Bot-Rolle muss in der Rollenliste über der Mitglied-Rolle stehen.",
        ephemeral: true
      });
    }

    if (member.roles.cache.has(role.id)) {
      return interaction.reply({
        content: "Du hast die Mitglied-Rolle bereits. Willkommen bei itsFlu! 💙",
        ephemeral: true
      });
    }

    await member.roles.add(role, "Serverregeln über den Akzeptieren-Button bestätigt");
    return interaction.reply({
      content: "✅ Du hast die Regeln akzeptiert und die Mitglied-Rolle erhalten. Willkommen bei itsFlu! 💙",
      ephemeral: true
    });
  } catch (error) {
    console.error("❌ Fehler bei der Regel-Akzeptierung:", error);
    const response = {
      content: "Die Rolle konnte gerade nicht vergeben werden. Bitte versuche es später erneut.",
      ephemeral: true
    };
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(response).catch(() => {});
    } else {
      await interaction.reply(response).catch(() => {});
    }
  }
});

client.login(process.env.DISCORD_TOKEN).catch(error => {
  console.error("❌ Discord-Login fehlgeschlagen:", error);
  process.exit(1);
});

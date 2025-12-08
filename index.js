// index.js
require("dotenv").config();
const {
  Client,
  GatewayIntentBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder
} = require("discord.js");

// .env から読み込み
const TOKEN = process.env.BOT_TOKEN;
const GUILD_ID = process.env.GUILD_ID;
const ROLE_ID = process.env.MEMBER_ROLE_ID;
const WELCOME_CHANNEL = process.env.WELCOME_CHANNEL_ID;

// Bot クライアント生成
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,           // サーバー情報
    GatewayIntentBits.GuildMessages,    // メッセージ監視
    GatewayIntentBits.MessageContent    // メッセージ内容取得
  ],
});

// Bot 起動時
client.once("ready", () => {
  console.log(`OJapp Bot が起動しました！ --> ${client.user.tag}`);
});


// ===========================================
//  ▼ メッセージコマンド
// ===========================================
client.on("messageCreate", async (msg) => {
  if (msg.author.bot) return;

  // ping テスト
  if (msg.content === "!ping") {
    await msg.reply("PONG!");
  }

  // セットアップ（ボタンを #welcome に設置）
  if (msg.content === "!setupbutton") {

    const embed = new EmbedBuilder()
      .setTitle("OJapp コミュニティへようこそ！")
      .setDescription("👇 ボタンを押して **メンバーロール** を取得してください")
      .setColor("#00ADEF");

    const button = new ButtonBuilder()
      .setCustomId("get_member_role")
      .setLabel("メンバーになる")
      .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder().addComponents(button);

    // welcome チャンネルを取得
    const channel = msg.guild.channels.cache.get(WELCOME_CHANNEL);
    if (!channel) {
      return msg.reply("❌ welcome チャンネルが見つかりません！");
    }

    // メッセージ送信
    await channel.send({ embeds: [embed], components: [row] });

    await msg.reply("✅ #welcome にロール付与ボタンを設置しました！");
  }
});


// ===========================================
//  ▼ ボタンが押されたとき
// ===========================================
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isButton()) return;

  if (interaction.customId === "get_member_role") {

    const role = interaction.guild.roles.cache.get(ROLE_ID);
    if (!role) {
      return interaction.reply({
        content: "❌ ロールが見つかりません！",
        ephemeral: true
      });
    }

    // 既に持ってる？
    if (interaction.member.roles.cache.has(ROLE_ID)) {
      return interaction.reply({
        content: "もうメンバーロール持ってるよ！",
        ephemeral: true
      });
    }

    // ロール付与！
    await interaction.member.roles.add(role);

    return interaction.reply({
      content: "🎉 メンバーロールを付与しました！ようこそ！",
      ephemeral: true
    });
  }
});

// ===========================================
//  ▼ Bot ログイン
// ===========================================
client.login(TOKEN);






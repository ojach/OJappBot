// index.js
require("dotenv").config();
const {
  Client,
  GatewayIntentBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ChannelType,
  PermissionsBitField
} = require("discord.js");

// .env から読み込み
const TOKEN = process.env.BOT_TOKEN;
const GUILD_ID = process.env.GUILD_ID;
const ROLE_ID = process.env.MEMBER_ROLE_ID;
const WELCOME_CHANNEL = process.env.WELCOME_CHANNEL_ID;
const SHOP_TICKET_CHANNEL = process.env.SHOP_TICKET_CHANNEL_ID;

// おじゃち（管理者）ユーザーID
const OWNER_ID = "990525943472873523";

// Bot クライアント生成
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
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

  // ---------------------------
  // ▼ welcome：ロール付与（既存）
  // ---------------------------
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

    const channel = msg.guild.channels.cache.get(WELCOME_CHANNEL);
    if (!channel) {
      return msg.reply("❌ welcome チャンネルが見つかりません！");
    }

    await channel.send({ embeds: [embed], components: [row] });
    await msg.reply("✅ #welcome にロール付与ボタンを設置しました！");
  }

  // ---------------------------
  // ▼ shop：チケット設置（新規）
  // ---------------------------
  if (msg.content === "!setupticket") {

    if (msg.author.id !== OWNER_ID) {
      return msg.reply("❌ このコマンドは管理者専用です");
    }

    const embed = new EmbedBuilder()
      .setTitle("🛍 作者登録申請")
      .setDescription(
        "OJapp ショップ作者になりたい方はこちら👇\n\n" +
        "・ボタンを押すと\n" +
        "・あなた専用のチャンネルが作成され\n" +
        "・運営と1対1でやり取りできます"
      )
      .setColor("#FF8A00");

    const button = new ButtonBuilder()
      .setCustomId("create_shop_ticket")
      .setLabel("🎫 作者登録チケットを作成")
      .setStyle(ButtonStyle.Success);

    const row = new ActionRowBuilder().addComponents(button);

    const channel = msg.guild.channels.cache.get(SHOP_TICKET_CHANNEL);
    if (!channel) {
      return msg.reply("❌ shop チケット用チャンネルが見つかりません！");
    }

    await channel.send({ embeds: [embed], components: [row] });
    await msg.reply("✅ #shop作者登録申請 にチケットボタンを設置しました！");
  }
});


// ===========================================
//  ▼ ボタンが押されたとき
// ===========================================
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isButton()) return;

  // ---------------------------
  // ▼ メンバーロール付与（既存）
  // ---------------------------
  if (interaction.customId === "get_member_role") {

    const role = interaction.guild.roles.cache.get(ROLE_ID);
    if (!role) {
      return interaction.reply({ content: "❌ ロールが見つかりません！", ephemeral: true });
    }

    if (interaction.member.roles.cache.has(ROLE_ID)) {
      return interaction.reply({ content: "もうメンバーロール持ってるよ！", ephemeral: true });
    }

    await interaction.member.roles.add(role);

    return interaction.reply({
      content: "🎉 メンバーロールを付与しました！ようこそ！",
      ephemeral: true
    });
  }

  // ---------------------------
  // ▼ 作者登録チケット作成（新規）
  // ---------------------------
  if (interaction.customId === "create_shop_ticket") {

    const guild = interaction.guild;
    const user = interaction.user;

    const channel = await guild.channels.create({
      name: `shop-ticket-${user.username}`,
      type: ChannelType.GuildText,
      permissionOverwrites: [
        {
          id: guild.id,
          deny: [PermissionsBitField.Flags.ViewChannel],
        },
        {
          id: user.id,
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages,
          ],
        },
        {
          id: OWNER_ID,
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages,
          ],
        },
      ],
    });

    await channel.send(
      `🛍 作者登録チケット\n\n${user} さん、\n・制作ジャンル\n・実績（あれば）\n・質問\nを送ってください！`
    );

    await interaction.reply({
      content: "✅ 作者登録用チケットを作成しました！",
      ephemeral: true
    });
  }
});

// ===========================================
//  ▼ Bot ログイン
// ===========================================
client.login(TOKEN);

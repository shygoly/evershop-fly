module.exports = {
  up: async (queryInterface) => {
    const shopId = process.env.CHATBOT_SHOP_ID || 'evershop-fly';
    const botId = process.env.CHATBOT_BOT_ID || '7567635028617412646';
    const enabled = true;
    const sql = `
      INSERT INTO chatbot_setting (shop_id, bot_id, enabled, created_at, updated_at)
      VALUES ($shopId, $botId, $enabled, NOW(), NOW())
      ON CONFLICT (shop_id)
      DO UPDATE SET bot_id = EXCLUDED.bot_id, enabled = EXCLUDED.enabled, updated_at = NOW();
    `;
    try {
      if (queryInterface && queryInterface.sequelize && queryInterface.sequelize.query) {
        await queryInterface.sequelize.query(sql, {
          bind: { $shopId: shopId, $botId: botId, $enabled: enabled }
        });
      } else {
        // Fallback API used by EverShop queryInterface
        await queryInterface.rawQuery(sql, { bind: { $shopId: shopId, $botId: botId, $enabled: enabled } });
      }
    } catch (e) {
      // Best-effort bootstrap; don't fail deployment if interface differs
      try {
        await queryInterface.sequelize.query(sql.replace(/\$([a-zA-Z]+)/g, (m, p) => {
          if (p === 'shopId') return `'${shopId}'`;
          if (p === 'botId') return `'${botId}'`;
          if (p === 'enabled') return enabled ? 'true' : 'false';
          return m;
        }));
      } catch (_ignore) {}
    }
  },
  down: async (queryInterface) => {
    const shopId = process.env.CHATBOT_SHOP_ID || 'evershop-fly';
    const sql = `DELETE FROM chatbot_setting WHERE shop_id = $shopId;`;
    try {
      if (queryInterface && queryInterface.sequelize && queryInterface.sequelize.query) {
        await queryInterface.sequelize.query(sql, { bind: { $shopId: shopId } });
      } else {
        await queryInterface.rawQuery(sql, { bind: { $shopId: shopId } });
      }
    } catch (_ignore) {}
  }
};



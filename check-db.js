const { Pool } = require('/app/node_modules/pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function check() {
  try {
    // 检查最新的产品图片记录
    const images = await pool.query('SELECT product_image_product_id, origin_image, single_image, listing_image, thumb_image FROM product_image ORDER BY product_image_product_id DESC LIMIT 3');
    console.log('\n=== Recent product images ===');
    console.log(JSON.stringify(images.rows, null, 2));

    // 检查最新的事件
    const events = await pool.query("SELECT event_id, name, created_at FROM event WHERE name = 'product_image_added' ORDER BY event_id DESC LIMIT 5");
    console.log('\n=== Recent product_image_added events ===');
    console.log(JSON.stringify(events.rows, null, 2));

    // 检查触发器是否存在
    const triggers = await pool.query("SELECT trigger_name, event_manipulation, event_object_table FROM information_schema.triggers WHERE trigger_name = 'PRODUCT_IMAGE_ADDED'");
    console.log('\n=== Trigger status ===');
    console.log(JSON.stringify(triggers.rows, null, 2));
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await pool.end();
  }
}

check();

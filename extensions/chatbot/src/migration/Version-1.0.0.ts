import { execute, PoolClient } from "@evershop/postgres-query-builder";

export default async (connection: PoolClient) => {
  // Create chatbot_setting table
  await execute(
    connection,
    `CREATE TABLE IF NOT EXISTS "chatbot_setting" (
      "setting_id" INT GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1) PRIMARY KEY,
      "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
      "shop_id" VARCHAR(255) UNIQUE NOT NULL,
      "shop_name" VARCHAR(255),
      "shop_logo_url" TEXT,
      "bot_id" VARCHAR(255),
      "sync_products" BOOLEAN DEFAULT true,
      "sync_orders" BOOLEAN DEFAULT true,
      "sync_customers" BOOLEAN DEFAULT true,
      "backend_api_url" VARCHAR(500) DEFAULT 'http://localhost:48080',
      "tenant_id" INT,
      "access_token" TEXT,
      "refresh_token" TEXT,
      "token_expires_at" TIMESTAMP WITH TIME ZONE,
      "last_sync_products" TIMESTAMP WITH TIME ZONE,
      "last_sync_orders" TIMESTAMP WITH TIME ZONE,
      "last_sync_customers" TIMESTAMP WITH TIME ZONE,
      "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )`
  );

  // Create index on shop_id for faster lookups
  await execute(
    connection,
    `CREATE INDEX IF NOT EXISTS "idx_chatbot_setting_shop_id" ON "chatbot_setting" ("shop_id")`
  );

  // Create chatbot_sync_log table to track sync history
  await execute(
    connection,
    `CREATE TABLE IF NOT EXISTS "chatbot_sync_log" (
      "log_id" INT GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1) PRIMARY KEY,
      "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
      "shop_id" VARCHAR(255) NOT NULL,
      "sync_type" VARCHAR(50) NOT NULL,
      "status" VARCHAR(50) NOT NULL,
      "item_count" INT DEFAULT 0,
      "error_message" TEXT,
      "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "FK_CHATBOT_SYNC_LOG_SETTING" FOREIGN KEY ("shop_id") 
        REFERENCES "chatbot_setting" ("shop_id") ON DELETE CASCADE
    )`
  );

  // Create index on shop_id and created_at for faster queries
  await execute(
    connection,
    `CREATE INDEX IF NOT EXISTS "idx_chatbot_sync_log_shop_created" 
     ON "chatbot_sync_log" ("shop_id", "created_at" DESC)`
  );
};


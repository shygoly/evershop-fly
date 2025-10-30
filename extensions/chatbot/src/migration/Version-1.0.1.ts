import { execute, PoolClient } from "@evershop/postgres-query-builder";

export default async (connection: PoolClient) => {
  // Create chatbot_conversation table
  await execute(
    connection,
    `CREATE TABLE IF NOT EXISTS "chatbot_conversation" (
      "conversation_id" VARCHAR(255) PRIMARY KEY,
      "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
      "shop_id" VARCHAR(255) NOT NULL,
      "customer_email" VARCHAR(255),
      "customer_name" VARCHAR(255),
      "status" VARCHAR(50) DEFAULT 'active',
      "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "FK_CHATBOT_CONVERSATION_SETTING" FOREIGN KEY ("shop_id") 
        REFERENCES "chatbot_setting" ("shop_id") ON DELETE CASCADE
    )`
  );

  // Create chatbot_message table
  await execute(
    connection,
    `CREATE TABLE IF NOT EXISTS "chatbot_message" (
      "message_id" INT GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1) PRIMARY KEY,
      "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
      "conversation_id" VARCHAR(255) NOT NULL,
      "shop_id" VARCHAR(255) NOT NULL,
      "sender" VARCHAR(10) NOT NULL CHECK (sender IN ('user', 'bot')),
      "content" TEXT NOT NULL,
      "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "FK_CHATBOT_MESSAGE_CONVERSATION" FOREIGN KEY ("conversation_id") 
        REFERENCES "chatbot_conversation" ("conversation_id") ON DELETE CASCADE
    )`
  );

  // Create indexes
  await execute(
    connection,
    `CREATE INDEX IF NOT EXISTS "idx_chatbot_conversation_shop" 
     ON "chatbot_conversation" ("shop_id", "status")`
  );

  await execute(
    connection,
    `CREATE INDEX IF NOT EXISTS "idx_chatbot_message_conversation" 
     ON "chatbot_message" ("conversation_id", "created_at")`
  );
};


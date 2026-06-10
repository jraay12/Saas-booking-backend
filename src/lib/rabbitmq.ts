import amqp, { Channel } from "amqplib";

let connection: any = null;
let channel: Channel | null = null;

export const connectRabbitMQ = async (): Promise<void> => {
  const url = process.env.RABBITMQ_URL;

  if (!url) {
    throw new Error("RABBITMQ_URL is not defined");
  }

  connection = await amqp.connect(url);
  channel = await connection.createChannel();

  console.log("🐰 RabbitMQ connected");
};

export const getRabbitChannel = (): Channel => {
  if (!channel) {
    throw new Error("RabbitMQ not initialized");
  }

  return channel;
};

export const closeRabbitMQ = async (): Promise<void> => {
  if (channel) {
    await channel.close();
    channel = null;
  }

  if (connection) {
    await connection.close();
    connection = null;
  }
};
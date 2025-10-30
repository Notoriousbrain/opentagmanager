import { Kafka } from "kafkajs";

async function startConsumer() {
  const brokers = process.env.KAFKA_BROKERS?.split(",") ?? ["localhost:9092"];
  const topic = process.env.KAFKA_TOPIC_INGEST ?? "osstag.ingest";

  const kafka = new Kafka({
    clientId: "osstag-consumer",
    brokers,
  });

  const consumer = kafka.consumer({ groupId: "osstag-relay-group" });

  await consumer.connect();
  await consumer.subscribe({ topic, fromBeginning: true });

  console.log(
    `✅ Relay Consumer connected to ${brokers.join(",")} on topic "${topic}"`
  );

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const payload = message.value?.toString() || "";
      console.log(`📦 [${topic}] ${payload}`);
    },
  });
}

startConsumer().catch((err) => {
  console.error("❌ Consumer crashed:", err);
  process.exit(1);
});

import { Kafka, logLevel, type Producer } from "kafkajs";
import { KafkaUnavailableError } from "./errors";
import type { NormalizedEvent } from "./types";

const {
  KAFKA_BROKERS,
  KAFKA_SASL_USERNAME,
  KAFKA_SASL_PASSWORD,
  KAFKA_SASL_MECHANISM,
  KAFKA_TOPIC_INGEST,
} = process.env;

let producer: Producer | null = null;

export async function getKafkaProducer(): Promise<Producer> {
  if (producer) return producer;

  if (!KAFKA_BROKERS || !KAFKA_TOPIC_INGEST) {
    throw new KafkaUnavailableError("Kafka configuration is missing", {
      detail: { KAFKA_BROKERS, KAFKA_TOPIC_INGEST },
    });
  }

  try {
    const kafka = new Kafka({
      clientId: "osstag-relay",
      brokers: KAFKA_BROKERS.split(","),
      ssl: true,
      sasl: {
        mechanism: (KAFKA_SASL_MECHANISM ?? "scram-sha-512") as any,
        username: KAFKA_SASL_USERNAME ?? "",
        password: KAFKA_SASL_PASSWORD ?? "",
      },
      logLevel: logLevel.ERROR,
    });

    producer = kafka.producer();
    await producer.connect();
    return producer;
  } catch (err) {
    throw new KafkaUnavailableError("Failed to initialize Kafka producer", {
      cause: err,
    });
  }
}

export async function sendBatchToKafka(
  events: NormalizedEvent[]
): Promise<void> {
  if (!events.length) return;

  const topic = KAFKA_TOPIC_INGEST!;
  const producer = await getKafkaProducer();

  try {
    await producer.send({
      topic,
      messages: events.map((event) => ({
        key: event.projectId,
        value: JSON.stringify(event),
      })),
    });
  } catch (err) {
    throw new KafkaUnavailableError("Failed to send batch to Kafka", {
      cause: err,
      detail: { topic, count: events.length },
    });
  }
}

export async function disconnectKafkaProducer(): Promise<void> {
  if (producer) {
    try {
      await producer.disconnect();
    } finally {
      producer = null;
    }
  }
}

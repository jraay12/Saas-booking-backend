import { getRabbitChannel, closeRabbitMQ } from "../../../lib/rabbitmq";
import { QUEUES } from "../../../lib/queue_names/queues";

export const bookingProducer = {
  bookingSuccess(data: {
    email: string;
    firstName: string;
    lastName: string;
    bookingDate: Date;
    startTime: string;
    bookingId: string;
    serviceName: string;
    servicePrice: number;
  }) {
    const channel = getRabbitChannel();

    channel.sendToQueue(
      QUEUES.EMAIL,
      Buffer.from(
        JSON.stringify({
          event: "BOOKING.SUCCESS",
          payload: data,
        }),
      ),
      { persistent: true },
    );

    setTimeout(() => closeRabbitMQ(), 500);
  },

  bookingConfirm(data: {
    email: string;
    firstName: string;
    lastName: string;
    bookingDate: Date;
    startTime: string;
  }) {
    const channel = getRabbitChannel();

    channel.sendToQueue(
      QUEUES.BOOKING,
      Buffer.from(
        JSON.stringify({
          event: "BOOKING.CONFIRMED",
          payload: data,
        }),
      ),
      { persistent: true },
    );

    setTimeout(() => closeRabbitMQ(), 500);
  },
};

import app from "./app";
import { connectRabbitMQ } from "./lib/rabbitmq";
import { startEmailConsumer } from "./modules/notification/email.consumer";

const PORT = process.env.PORT || 3000;

async function bootstrap() {
  try {
    await connectRabbitMQ();

    await startEmailConsumer()
    
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Startup failed:", err);
    process.exit(1);
  }
}

bootstrap();

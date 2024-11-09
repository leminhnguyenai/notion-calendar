import app from "./app";
import MessageQueue from "./services/messageQueue";
export const PORT = 6060;
const messageQueue = new MessageQueue();

app.set("messageQueue", messageQueue);
app.listen(PORT, () => {
  console.log(`The server is on http://localhost: ` + PORT);
});

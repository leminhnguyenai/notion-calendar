import app from './app';
import MessageQueue from './services/messageQueue';
import SchedulerScanner from './services/scheduler/schedulerScanner';
export const PORT = 6060;
export const messageQueue = new MessageQueue();
export const schedulerScanner = new SchedulerScanner();

app.set('messageQueue', messageQueue);
app.set('scheduler', schedulerScanner);
app.listen(PORT, () => {
    schedulerScanner.checkEveryMinute();
    console.log(`The server is on http://localhost: ` + PORT);
});

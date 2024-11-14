import cors from 'cors';
import express, { Application, Request, Response } from 'express';
import auth from './routes/auth';
import connections from './routes/connections';
import users from './routes/users';
import notionData from './routes/notionData';
const app: Application = express();

app.use(cors());

app.get('/', (req: Request, res: Response) => {
    res.status(200).send('notion-calendar is on');
});

app.use('/connections', connections);
app.use('/users', users);
app.use('/auth', auth);
app.use('/notion-data', notionData);

export default app;

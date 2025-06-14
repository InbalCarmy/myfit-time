import express, { Request, Response } from 'express';

const app = express();
const PORT = 3001;

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.send('MyFitTime API is running 🚀');
});

app.post('/test', (req: Request, res: Response) => {
  res.json({ message: 'Received!', data: req.body });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

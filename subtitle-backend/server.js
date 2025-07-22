// server.js (ESM)
import express from 'express';
import cors from 'cors';
import textbasedRoutes from './routes/textBasedRoutes.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/textbased', textbasedRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
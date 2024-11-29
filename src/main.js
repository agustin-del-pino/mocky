import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import Config from './config.js';
import { addEndpoint, deleteEndpoints, deleteEndpointResponses, getAllEndpoint, updateEndpointResponses, exectuteMock } from './actions.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.get('/ping', (req, res) => res.status(200).json({ message: 'pong' }));
app.get('/api/v1/mocky', getAllEndpoint);
app.post('/api/v1/mocky', addEndpoint);
app.delete('/api/v1/mocky', deleteEndpoints);
app.put('/api/v1/mocky/responses', updateEndpointResponses);
app.delete('/api/v1/mocky/responses', deleteEndpointResponses);

app.use('/api/v1/mock/*', exectuteMock)

app.listen(Config.port, () => console.log(`Server running at http://localhost:${Config.port}`));

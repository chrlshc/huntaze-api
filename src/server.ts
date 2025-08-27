import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { validateEnv } from './config/env';

validateEnv();
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});

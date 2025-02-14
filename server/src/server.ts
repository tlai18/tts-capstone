import express, { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();
const cors = require('cors');

// Middleware to parse JSON bodies
app.use(express.json());

const corsOptions = {
    origin: 'http://localhost:3000', 
    methods: 'GET,POST', 
    allowedHeaders: ['Content-Type', 'Authorization'] 
};

app.use(cors(corsOptions));

// Simulated Shibboleth login route
app.get('/auth/login', (req: Request, res: Response) => {
  // In the future, this will redirect the user to the Shibboleth IdP
  // Simulate the redirect for now
  res.send('Redirecting to Shibboleth IdP for authentication... (simulated)');
});

// Simulated Shibboleth callback route
app.post('/auth/callback', async (req: Request, res: Response) => {
  // Simulate receiving user attributes from the Shibboleth IdP
  const mockProfile = {
    email: 'mockuser@example.com',
    name: 'Mock User',
  };

//   try {
//     // Check if the user exists in the database
//     let user = await prisma.user.findUnique({ where: { email: mockProfile.email } });

//     if (!user) {
//       // If the user does not exist, create a new user
//       user = await prisma.user.create({
//         data: { email: mockProfile.email, name: mockProfile.name },
//       });
//     }

//     // Simulate setting a session or a cookie
//     // In a real application, use a session middleware like `express-session`
//     res.json({ message: 'User logged in successfully', user });
//   } catch (error) {
//     res.status(500).json({ message: 'Error during authentication', error });
//   }
});

// Middleware placeholder for future Shibboleth authentication
const shibbolethMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Future: Replace this with actual Shibboleth attribute checks
  const isAuthenticated = true; // Simulate that the user is authenticated

  if (isAuthenticated) {
    // Simulate user attributes from Shibboleth
    req.user = {
      email: 'mockuser@example.com',
      name: 'Mock User',
    };
    next();
  } else {
    res.status(401).send('User not authenticated');
  }
};

// Apply the Shibboleth middleware to protect routes
app.use('/protected', shibbolethMiddleware);

app.get('/protected', (req: Request, res: Response) => {
  // This route is protected by the simulated Shibboleth middleware
  res.send('This is a protected route. You must be logged in to view this.');
});

// Test route
app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to the app structured for future Shibboleth integration!');
});

// Fetch Data from IP
app.post('/getData', async (req: Request, res: Response) => {
    const ip = req.body.ip;

    if (ip === undefined) {
        res.status(400).send("Bad Request: IP address is required in JSON format");
        return;
    }
  
    const hosts = await prisma.host.findMany({
        where: {
            host: ip,
        },
    });
  
    res.json(hosts);
});

// Start the Express server
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

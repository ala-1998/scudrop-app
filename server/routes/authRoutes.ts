import { Router, Request, Response } from 'express';

export const authRouter = Router();

// Single authorized user requested by the client:
// Email: Frscudrop@gmail.com
// Mot de passe: Fourat12345;
const AUTHORIZED_EMAIL = 'frscudrop@gmail.com';
const AUTHORIZED_PASSWORD = 'Fourat12345;';

/**
 * POST /api/auth/login
 * Validates credentials and returns session info
 */
authRouter.post('/login', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Veuillez saisir votre adresse email et votre mot de passe.',
      });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanPassword = String(password);

    if (cleanEmail !== AUTHORIZED_EMAIL || cleanPassword !== AUTHORIZED_PASSWORD) {
      return res.status(401).json({
        error: 'Identifiants incorrects. Seul le compte autorisé Frscudrop@gmail.com est admis.',
      });
    }

    // Return success authentication token & user info
    const token = 'scudrop_auth_session_' + Buffer.from(cleanEmail + ':' + Date.now()).toString('base64');

    return res.json({
      success: true,
      token,
      user: {
        email: 'Frscudrop@gmail.com',
        name: 'Fourat - Scudrop',
        role: 'Administrateur',
      },
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Erreur serveur lors de la connexion' });
  }
});

/**
 * GET /api/auth/me
 * Verifies if current session is valid
 */
authRouter.get('/me', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer scudrop_auth_session_')) {
    return res.status(401).json({ authenticated: false });
  }

  return res.json({
    authenticated: true,
    user: {
      email: 'Frscudrop@gmail.com',
      name: 'Fourat - Scudrop',
      role: 'Administrateur',
    },
  });
});

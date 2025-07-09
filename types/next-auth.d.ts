// types/next-auth.d.ts

import { Role } from '@prisma/client';
import NextAuth, { DefaultSession, DefaultUser } from 'next-auth';
import { JWT, DefaultJWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface User {
    id: string;
    role: Role;
    nama: string;
  }
  
  interface Session {
    user: {
      id: string;
      role: Role;
      nama: string;
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id: string;
    role: Role;
    nama: string;
  }
}
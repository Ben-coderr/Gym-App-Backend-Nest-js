// src/interfaces/request.interface.ts
import { Request } from 'express';
import { Owner } from '@prisma/client';
import { Member } from '@prisma/client';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    type: 'owner' | 'member';
    owner?: Owner;
    member?: Member;
  };
}
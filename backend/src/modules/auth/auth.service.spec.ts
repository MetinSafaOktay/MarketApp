/**
 * AuthService birim testleri: token üretimi/ROTASYONU, hatalı kimlik, kapatılmış
 * hesap, süresi geçmiş/iptal refresh. Prisma + JwtService + bcrypt mock'lanır.
 */
import {
  BadRequestException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';

// Jest'in elle kurulan mock'ları ve expect.objectContaining doğası gereği `any` üretir.
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

jest.mock('bcrypt');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

function makePrisma() {
  return {
    users: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn().mockResolvedValue({}),
      findUniqueOrThrow: jest.fn(),
    },
    refresh_tokens: {
      create: jest.fn().mockResolvedValue({}),
      findUnique: jest.fn(),
      update: jest.fn().mockResolvedValue({}),
      updateMany: jest.fn().mockResolvedValue({}),
    },
  };
}

const activeUser = {
  id: 'u1',
  role: 'customer',
  is_active: true,
  password_hash: 'hashed',
  email: 'a@b.com',
  first_name: 'A',
};

describe('AuthService', () => {
  let prisma: ReturnType<typeof makePrisma>;
  let jwt: { sign: jest.Mock };
  let service: AuthService;

  beforeEach(() => {
    prisma = makePrisma();
    jwt = { sign: jest.fn().mockReturnValue('access.jwt') };
    service = new AuthService(prisma as never, jwt as never);
    mockedBcrypt.hash.mockResolvedValue('hashed' as never);
    mockedBcrypt.compare.mockResolvedValue(true as never);
  });

  describe('register', () => {
    it('requires an email or a phone', async () => {
      await expect(
        service.register({ password: 'secret12' } as never),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects a duplicate identifier', async () => {
      prisma.users.findFirst.mockResolvedValue(activeUser);
      await expect(
        service.register({ email: 'a@b.com', password: 'secret12' } as never),
      ).rejects.toThrow(ConflictException);
    });

    it('creates the user, issues tokens and never returns the password hash', async () => {
      prisma.users.findFirst.mockResolvedValue(null);
      prisma.users.create.mockResolvedValue(activeUser);

      const result = await service.register({
        email: 'a@b.com',
        password: 'secret12',
      } as never);

      expect(result.accessToken).toBe('access.jwt');
      expect(result.refreshToken).toEqual(expect.any(String));
      expect(result.user).not.toHaveProperty('password_hash');
      expect(prisma.refresh_tokens.create).toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('rejects wrong credentials', async () => {
      prisma.users.findFirst.mockResolvedValue(activeUser);
      mockedBcrypt.compare.mockResolvedValue(false as never);
      await expect(
        service.login({ email: 'a@b.com', password: 'bad' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('rejects a deactivated account', async () => {
      prisma.users.findFirst.mockResolvedValue({
        ...activeUser,
        is_active: false,
      });
      await expect(
        service.login({ email: 'a@b.com', password: 'secret12' }),
      ).rejects.toThrow('kapatılmış');
    });

    it('returns tokens and touches last_active_at on success', async () => {
      prisma.users.findFirst.mockResolvedValue(activeUser);
      const result = await service.login({
        email: 'a@b.com',
        password: 'secret12',
      });
      expect(result.accessToken).toBe('access.jwt');
      expect(prisma.users.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'u1' } }),
      );
    });
  });

  describe('refresh', () => {
    it('rejects an unknown, revoked or expired token', async () => {
      prisma.refresh_tokens.findUnique.mockResolvedValueOnce(null);
      await expect(service.refresh('x')).rejects.toThrow(UnauthorizedException);

      prisma.refresh_tokens.findUnique.mockResolvedValueOnce({
        id: 'r1',
        user_id: 'u1',
        revoked_at: new Date(),
        expires_at: new Date(Date.now() + 1000),
      });
      await expect(service.refresh('x')).rejects.toThrow(UnauthorizedException);

      prisma.refresh_tokens.findUnique.mockResolvedValueOnce({
        id: 'r1',
        user_id: 'u1',
        revoked_at: null,
        expires_at: new Date(Date.now() - 1000),
      });
      await expect(service.refresh('x')).rejects.toThrow(UnauthorizedException);
    });

    it('rotates: revokes the old token and issues a new pair', async () => {
      prisma.refresh_tokens.findUnique.mockResolvedValue({
        id: 'r1',
        user_id: 'u1',
        revoked_at: null,
        expires_at: new Date(Date.now() + 100_000),
      });
      prisma.users.findUniqueOrThrow.mockResolvedValue(activeUser);

      const result = await service.refresh('old-token');

      expect(prisma.refresh_tokens.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'r1' },
          data: expect.objectContaining({ revoked_at: expect.any(Date) }),
        }),
      );
      expect(result.accessToken).toBe('access.jwt');
      expect(result.refreshToken).toEqual(expect.any(String));
    });
  });
});

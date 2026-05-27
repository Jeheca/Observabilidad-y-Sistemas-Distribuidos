import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { getToken } from '@willsoto/nestjs-prometheus';
import { PinoLogger } from 'nestjs-pino';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User } from './entities/user.entity';

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: { findOne: jest.fn(), create: jest.fn(), save: jest.fn() }
        },
        { provide: getToken('auth_logins_total'), useValue: { inc: jest.fn() } },
        { provide: getToken('auth_registrations_total'), useValue: { inc: jest.fn() } },
        { provide: PinoLogger, useValue: { info: jest.fn(), warn: jest.fn(), setContext: jest.fn() } }
      ]
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

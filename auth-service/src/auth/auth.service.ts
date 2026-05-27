import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { PinoLogger } from 'nestjs-pino';
import { Counter } from 'prom-client';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { User } from './entities/user.entity';

export interface PublicUser {
  id: number;
  name: string;
  email: string;
}

export interface LoginResponse {
  user: PublicUser;
  token: string;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    @InjectMetric('auth_logins_total') private readonly loginsCounter: Counter<string>,
    @InjectMetric('auth_registrations_total') private readonly registrationsCounter: Counter<string>,
    private readonly logger: PinoLogger
  ) {
    this.logger.setContext(AuthService.name);
  }

  async register(createUserDto: CreateUserDto): Promise<PublicUser> {
    const existing = await this.usersRepository.findOne({ where: { email: createUserDto.email } });
    if (existing) throw new ConflictException(`Ya existe un usuario con el correo ${createUserDto.email}`);
    const newUser = this.usersRepository.create(createUserDto);
    const saved = await this.usersRepository.save(newUser);
    this.registrationsCounter.inc();
    const logData = { event: 'register_success', userId: saved.id, email: saved.email }
    this.logger.info(logData, 'Registro de usuario exitoso');
    return this.toPublicUser(saved);
  }

  async login(loginDto: LoginDto): Promise<LoginResponse> {
    const user = await this.usersRepository.findOne({ where: { email: loginDto.email } });

    if (!user || user.password !== loginDto.password) {
      this.loginsCounter.inc({ result: 'failure' });
      const logData = { event: 'login_failed', email: loginDto.email }
      this.logger.warn(logData, 'Inicio de sesión fallido');
      throw new UnauthorizedException('Correo o contraseña incorrectos');
    }

    this.loginsCounter.inc({ result: 'success' });
    const logData = { event: 'login_success', userId: user.id, email: user.email }
    this.logger.info(logData, 'Inicio de sesión exitoso');
    return { user: this.toPublicUser(user), token: `taracea-${user.id}-${Date.now()}` };
  }

  private toPublicUser(user: User): PublicUser {
    return { id: user.id, name: user.name, email: user.email };
  }
}

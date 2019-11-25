import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from './user.repository';
import { AuthCredentialsDto } from './dto/auth.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserRepository)
    private userRepository: UserRepository,
    private jwtService: JwtService,
  ) {}

  async signUp(authCredentialsDto: AuthCredentialsDto): Promise<{ token: string }> {
    const email = await this.userRepository.signUp(authCredentialsDto);

    if (!email) { throw new UnauthorizedException('Invalid Credentials'); }

    const payload: JwtPayload = { email };

    const token = await this.jwtService.sign(payload);

    return { token };
  }

  async signIn(authCredentialsDto: AuthCredentialsDto): Promise<{ token: string }> {
    const email = await this.userRepository.signIn(authCredentialsDto);

    if (!email) { throw new UnauthorizedException('Invalid Credentials'); }

    const payload: JwtPayload = { email };

    const token = await this.jwtService.sign(payload);

    return { token };
  }
}

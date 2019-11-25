import { Repository, EntityRepository } from 'typeorm';
import { User } from './user.entity';
import { AuthCredentialsDto } from './dto/auth.dto';
import * as gravatar from 'gravatar';
import * as bcrypt from 'bcrypt';
import { ConflictException, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';

@EntityRepository(User)
export class UserRepository extends Repository<User> {
  async signUp(authCredentialsDto: AuthCredentialsDto): Promise<string> {
    const { name, email, password } = authCredentialsDto;

    const avatar = gravatar.url(email, { s: '200', r: 'pg', d: 'mm' });

    const salt = await bcrypt.genSalt(10);

    const user = new User();
    user.name = name;
    user.email = email;
    user.password = await bcrypt.hash(password, salt);
    user.avatar = avatar;

    try {
      await user.save();
      return user.email;
    } catch (error) {
      if (error.code === '23505') { throw new ConflictException('Email already exists'); }
      throw new InternalServerErrorException();
    }
  }

  async signIn(authCredentialsDto: AuthCredentialsDto): Promise<string> {
    const { email, password } = authCredentialsDto;
    const user = await this.findOne({ email });

    if (!user) { throw new NotFoundException('User not found'); }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) { throw new UnauthorizedException('Invalid Credentials'); }

    return user.email;
  }
}

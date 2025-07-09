import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { Role, User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Driver } from 'src/drivers/entities/driver.entity';
import { Order } from 'src/orders/entities/order.entity';
import { Store } from 'src/stores/entities/store.entity';
import * as Bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { AppMailerService } from 'src/mailer/mailer.service';
import * as otpGenerator from 'otp-generator';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Driver) private driverRepository: Repository<Driver>,
    @InjectRepository(Order) private orderRepository: Repository<Order>,
    @InjectRepository(Store) private storeRepository: Repository<Store>,
    private configService: ConfigService,
    private readonly appMailerService: AppMailerService,

    private jwtService: JwtService,
  ) {}
  private async hashData(data: string): Promise<string> {
    const salt = await Bcrypt.genSalt(10);
    return Bcrypt.hash(data, salt);
  }
  //generate tokens for user
  private async getTokens(user_id: number, email: string, role: string) {
    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: user_id,
          email: email,
          role: role, // Include the role in the access token payload
        },
        {
          secret: this.configService.getOrThrow<string>(
            'JWT_ACCESS_TOKEN_SECRET',
          ),
          expiresIn: this.configService.getOrThrow<string>(
            'JWT_ACCESS_TOKEN_EXPIRATION_TIME',
          ),
        },
      ),
      this.jwtService.signAsync(
        {
          sub: user_id,
          email: email,
          role: role,
        },
        {
          secret: this.configService.getOrThrow<string>(
            'JWT_REFRESH_TOKEN_SECRET',
          ),
          expiresIn: this.configService.getOrThrow<string>(
            'JWT_REFRESH_TOKEN_EXPIRATION_TIME',
          ),
        },
      ),
    ]);
    return { accessToken: at, refreshToken: rt };
  }
  //save refresh token in db
  private async saveRefreshToken(user_id: number, refreshToken: string) {
    //hash the refresh token
    const hashedRefreshToken = await this.hashData(refreshToken);

    //save the hashed refresh token in the datadase
    await this.userRepository.update(user_id, {
      hashedRefreshToken: hashedRefreshToken,
    });
    return hashedRefreshToken;
  }

  //signin user
  async signIn(createAuthDto: CreateAuthDto) {
    const founduser = await this.userRepository.findOne({
      where: { email: createAuthDto.email },
      select: ['id', 'email', 'password', 'role', 'otp', 'full_name'],
    });
    if (!founduser) {
      throw new Error(`User with email ${createAuthDto.email} not found`);
    }
    // compare hashed password with the one in the database
    const foundpassword = await Bcrypt.compare(
      createAuthDto.password,
      founduser.password,
    );
    if (!foundpassword) {
      throw new NotFoundException(
        `wrong credentials for user with email ${createAuthDto.email}`,
      );
    }

    if (createAuthDto.otp !== founduser.otp) {
      throw new NotFoundException('Invalid OTP');
    }

    // if the user is found and the password matches
    const { accessToken, refreshToken } = await this.getTokens(
      founduser.id,
      founduser.email,
      founduser.role,
    );

    founduser.is_active = true; // Ensure user is active

    await this.saveRefreshToken(founduser.id, refreshToken);

    return { founduser, accessToken, refreshToken };
  }

  //signout
  async signOut(user_id: number) {
    const result = await this.userRepository.update(user_id, {
      hashedRefreshToken: null,
      is_active: false
    });

    if (result.affected === 0) {
      throw new Error('Signout failed — no user was updated');
    }
    return { message: `User with id: ${user_id} signed out successfully ✔️` };
  }
  //refresh token
  async refreshTokens(id: number, refreshToken: string) {
    const founduser = await this.userRepository.findOne({
      where: { id },
      select: ['id', 'email', 'hashedRefreshToken', 'role'],
    });
    if (!founduser) {
      throw new NotFoundException(`user wth id ${id}not found`);
    }
    //check if user has refresh token
    if (!founduser.hashedRefreshToken) {
      throw new NotFoundException(`user wth id ${id} has no refresh token`);
    }
    //check if refresh token is valid
    const isRefreshTokenValid = await Bcrypt.compare(
      refreshToken,
      founduser.hashedRefreshToken,
    );
    if (!isRefreshTokenValid) {
      throw new NotFoundException(`invalid refresh token with id ${id}`);
    }
    //generate new access tand refresh token
    const { accessToken, refreshToken: newrefreshToken } = await this.getTokens(
      founduser.id,
      founduser.email,
      founduser.role, // Assuming role is a property of User entity
    );
    //update the store refresh token
    await this.saveRefreshToken(founduser.id, newrefreshToken);
    //return the new tokens
    return { accessToken, refreshToken: newrefreshToken };
  }
  //signup user
  async SignUp(createUserDto: CreateUserDto) {
    console.log("first")
    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
      select: ['id', 'email', 'password'],
    });
    if (existingUser) {
      throw new Error('User already exists');
    }

    // Generate OTP (6-digit numeric)
    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      specialChars: false,
    });


    // hash password
    const hashedPassword = await Bcrypt.hash(createUserDto.password, 10);

    // create and save new user
    const user = this.userRepository.create({
      full_name: createUserDto.full_name,
      email: createUserDto.email,
      phone_number: createUserDto.phone_number,
      password: hashedPassword,
      role: createUserDto.role || Role.CUSTOMER, // Default to CUSTOMER if not provided
      otp: otp,
    });
    // generate tokens
    const savedUser = await this.userRepository.save(user);
    const { accessToken, refreshToken } = await this.getTokens(
      savedUser.id,
      savedUser.email,
      savedUser.role,
    );
    // Save refresh token in the database
    await this.saveRefreshToken(savedUser.id, refreshToken);

    // Fetch updated user (with hashedRefreshToken)
    const updatedUser = await this.userRepository.findOne({
      where: { id: savedUser.id },
    });
    try {
      await this.appMailerService.sendWelcomeMail(
        savedUser.email,
        savedUser.full_name,
        accessToken,
        otp,
      );
    } catch (err) {
      console.error('Error sending welcome email:', err);
    }
    console.log(`updated user`, updatedUser);
    return { user: updatedUser };
  }
}

import { Repository } from "typeorm";
import { UsersEntity } from "../user/user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Injectable, InternalServerErrorException, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UserService } from "../user/user.service";
import { InOutService } from "../in-out/in-out.service";
import { PasswordService } from "../service/password.service";
import { UserRegisterDto } from "../dto/user/register.dto";
import { ResponseRegister } from "./interface/response.register";
import { UserLoginDto } from "../dto/user/login.dto";
import * as config from 'config';
import { Role, roles } from "../enum/role.enum";

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UsersEntity)
    private usersRepository: Repository<UsersEntity>,

    private jwtService: JwtService,
    private userService: UserService,
    private inOutService: InOutService,
    private passwordService: PasswordService
  ) {}


  async findAll() {
    console.log('Users Service Called');
    return await this.usersRepository.find();
  }    

  findOneById(id: number) {
    return this.usersRepository.findOneBy({ id });
  }

  async register(data: UserRegisterDto): Promise<ResponseRegister> {
      const { password, password_confirm } = data;

      if (password !== password_confirm) {
        throw new InternalServerErrorException("Passwords don't match!");
      }

      const hashedPassword = await this.passwordService.hashPassword(password);
      data.hashedPassword = hashedPassword;

      const new_user = data.toEntity();

      return await this.usersRepository
        .insert(new_user)
        .then((res) => {
          const response = new ResponseRegister();
          response.statusCode = 201;
          response.message = 'User created successfully';
          response.id = res.raw[0].id;
          return response;
        })
        .catch((e) => {
          throw new InternalServerErrorException(e.message || e);
        });

  }

  async login(data: UserLoginDto): Promise<{ access_token: string }> {
    const user = await this.userService.findOne(data.username);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValidPassword = await this.userService.comparePassword(data.password, user.password);
    if (!isValidPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const jwtConfig = config.get('jwt');
    const secretOrPrivateKey = jwtConfig.secret;

    const payload = { username: user.username, sub: user.id, role: user.roles }; 
    const accessToken = await this.jwtService.signAsync(payload, { secret: secretOrPrivateKey });

    await this.userService.updateAccessToken(user.id, accessToken);
    await this.inOutService.logAction(user.id, 'login', accessToken ); 

    return { access_token: accessToken };
  }

  async logout(data: UserLoginDto): Promise<void> {
    const user = await this.userService.findOne(data.username);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const existingLog = await this.inOutService.findLog(user.id, 'login');
    if (!existingLog) {
      throw new UnauthorizedException('User must be logged in first');
    }

    await this.inOutService.logAction(user.id, 'logout', null); // userId yerine user.id kullanılıyor

  }

  async generateAccessToken(user: UsersEntity): Promise<string> {
    const payload = { username: user.username, sub: user.id }; // Burada userId yerine user.id kullanılıyor
    return this.jwtService.sign(payload);
  }

}

export function getPermissionsFromRole(role: Role): string[] {
  return roles[role];
}

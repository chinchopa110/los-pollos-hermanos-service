import { ApiProperty } from '@nestjs/swagger';

export class AuthUserDto {
  @ApiProperty({ example: 'Густаво Фринг' })
  name!: string;

  @ApiProperty({ example: 'admin' })
  username!: string;
}

export class LoginResponseDto {
  @ApiProperty({ type: AuthUserDto })
  user!: AuthUserDto;
}

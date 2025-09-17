import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokenDto {
  @ApiProperty({
    description: 'JWT refresh token for obtaining a new access token',
    example: 'eyJhbGc...',
  })
  @IsString()
  @IsNotEmpty()
  refreshToken!: string;
}

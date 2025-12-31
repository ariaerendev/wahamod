import { ApiExtraModels, ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { BinaryFile, RemoteFile } from '@waha/structures/files.dto';
import { ChatIdProperty } from '@waha/structures/properties.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class MyProfile {
  @ChatIdProperty()
  id: string;

  name: string;

  @ApiProperty({
    example: 'https://example.com/picture.jpg',
  })
  picture: string | null;
}

export class ProfileNameRequest {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'My New Name',
  })
  name: string;
}

export class ProfileStatusRequest {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: '🎉 Hey there! I am using WhatsApp 🎉',
  })
  status: string;
}

@ApiExtraModels(RemoteFile, BinaryFile)
export class ProfilePictureRequest {
  @ApiProperty({
    oneOf: [
      { $ref: getSchemaPath(RemoteFile) },
      { $ref: getSchemaPath(BinaryFile) },
    ],
  })
  file: BinaryFile | RemoteFile;
}

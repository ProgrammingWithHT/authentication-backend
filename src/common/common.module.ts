import { Module } from '@nestjs/common';
import { EncryptionService } from './security/encryption.service';

@Module({
  providers: [EncryptionService],
  exports: [EncryptionService],
})
export class CommonModule {}

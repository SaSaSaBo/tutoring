import { Injectable } from '@nestjs/common';

@Injectable()
export class LogService {
    async logShareAction(profileId: number, userId: number, shared: boolean): Promise<void> {
        // Implement logging logic
    }
}

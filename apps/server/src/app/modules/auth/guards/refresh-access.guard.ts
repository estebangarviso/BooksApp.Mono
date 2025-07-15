import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtStrategyTypes } from '../auth.constant';

@Injectable()
export class RefreshAccessGuard extends AuthGuard(JwtStrategyTypes.REFRESH) {}

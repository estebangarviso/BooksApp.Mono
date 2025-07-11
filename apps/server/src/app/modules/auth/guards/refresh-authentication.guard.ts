import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtStrategyTypes } from '../auth.constant';

@Injectable()
export class RefreshAuthenticationAccessGuard extends AuthGuard(
	JwtStrategyTypes.REFRESH,
) {}

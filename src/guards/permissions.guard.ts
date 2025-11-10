import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";

@Injectable()
export class PermissionsGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user) {
            throw new UnauthorizedException('Usuário não autenticado');
        }

        const entidade = user?.equipe?.entidade;
        if (!entidade) {
            throw new UnauthorizedException('Usuário não possui entidade associada');
        }   

        const entidadeAdm = "ATI";

        if (entidade == entidadeAdm) {
            return true
        } else{
            throw new UnauthorizedException('Usuário não possui permissão necessária');
        }
    }
}
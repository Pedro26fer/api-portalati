// import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";


import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, ILike } from "typeorm";
import { Entidade } from "src/entidade/entidade.entity";

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    @InjectRepository(Entidade)
    private readonly entidadeRepository: Repository<Entidade>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException("Usuário não autenticado");
    }

    const entidadeUsuarioId = user?.equipe?.entidade?.id;
    if (!entidadeUsuarioId) {
      throw new UnauthorizedException("Usuário não possui entidade associada");
    }

    // Busca a entidade cujo nome contenha "ATI" (ignorando maiúsculas/minúsculas)
    const entidadeAdm = await this.entidadeRepository.findOne({
      where: { nome: ILike("%ATI%") },
    });

    if (!entidadeAdm) {
      throw new UnauthorizedException("Entidade ADM não encontrada");
    }

    // Compara IDs
    if (entidadeUsuarioId === entidadeAdm.id) {
      return true;
    } else {
      throw new UnauthorizedException("Usuário não possui permissão necessária");
    }
  }
}


// @Injectable()
// export class PermissionsGuard implements CanActivate {
//     canActivate(context: ExecutionContext): boolean {
//         const request = context.switchToHttp().getRequest();
//         const user = request.user;
//         if (!user) {
//             throw new UnauthorizedException('Usuário não autenticado');
//         }

//         const entidade = user?.equipe?.entidade.nome;
//         if (!entidade) {
//             throw new UnauthorizedException('Usuário não possui entidade associada');
//         }   

//         const entidadeAdm = "ATI";

//         if (entidade == entidadeAdm) {
//             return true
//         } else{
//             throw new UnauthorizedException('Usuário não possui permissão necessária');
//         }
//     }
// }
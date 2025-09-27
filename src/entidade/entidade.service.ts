import { Injectable, NotFoundException, ForbiddenException} from "@nestjs/common";
import { CreateEntidadeDto } from "./dto/createEntidade.dto";
import { UpdateEntidadeDto } from "./dto/updateEntidade.dto";
import { Entidade } from "./entidade.entity";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";


@Injectable()
export class EntidadeService {
    constructor(
        @InjectRepository(Entidade)
        private entidadeRepository: Repository<Entidade>
    ){}

    async createEntidade(createEntidadeDto: CreateEntidadeDto): Promise<Entidade>{
        const {nome, logo, link} = createEntidadeDto

        if (!nome || !link){
            throw new ForbiddenException('Nome e Link são campos obrigatórios')
        }

        const nomeAlredyExists = await this.entidadeRepository.findOne({where: {nome}})

        if (nomeAlredyExists) {
            throw new ForbiddenException('Já existe uma entidade com esse nome')
        }

        const logoAlredyExists = await this.entidadeRepository.findOne({where: {logo}})

        if (logoAlredyExists && logo != undefined) {
            throw new ForbiddenException('Já existe uma entidade com esse logo')
        }

        const linkAlredyExists = await this.entidadeRepository.findOne({where: {link}})

        if (linkAlredyExists) {
            throw new ForbiddenException('Já existe uma entidade com esse link')
        }

        const newEntidade = this.entidadeRepository.create(createEntidadeDto)

        return await this.entidadeRepository.save(newEntidade)
    }

    async findAll(): Promise<Entidade[]>{
        return await this.entidadeRepository.find()
    }

    async profile(id: string): Promise<Entidade>{
        const entidade = await this.entidadeRepository.findOne({where: {id}})

        if (!entidade) {
            throw new NotFoundException('Entidade não encontrada')
        }

        return entidade
    }


    async updateEntidade(id: string, updateEntidadeDto: UpdateEntidadeDto): Promise<Entidade>{
        const entidade = await this.profile(id)

        if(updateEntidadeDto.nome){
            const nomeAlredyExists = await this.entidadeRepository.findOne({where: {nome: updateEntidadeDto.nome}})

            if (nomeAlredyExists) {
                throw new ForbiddenException('Já existe uma entidade com esse nome')
            }

            entidade.nome = updateEntidadeDto.nome
        }

        if(updateEntidadeDto.logo){
            const logoAlredyExists = await this.entidadeRepository.findOne({where: {logo: updateEntidadeDto.logo}})

            if (logoAlredyExists) {
                throw new ForbiddenException('Já existe uma entidade com esse logo')
            }

            entidade.logo = updateEntidadeDto.logo
        }

        if(updateEntidadeDto.link){
            const linkAlredyExists = await this.entidadeRepository.findOne({where: {link: updateEntidadeDto.link}})

            if (linkAlredyExists) {
                throw new ForbiddenException('Já existe uma entidade com esse link')
            }

            entidade.link = updateEntidadeDto.link
        }

        return await this.entidadeRepository.save(entidade)
    }

    async deleteEntidade(id: string): Promise<void>{
        const entidadeToDelete = await this.profile(id)
        await this.entidadeRepository.remove(entidadeToDelete)
    }

}
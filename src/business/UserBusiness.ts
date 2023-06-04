import { UserDatabase } from "../database/UserDatabase";
import { LoginInputDTO, LoginOutputDTO } from "../dtos/user/login.dto";
import { SignupInputDTO, SignupOutputDTO, } from "../dtos/user/singnup.dto";
import { BadRequestError } from "../errors/BadRequestError";
import { NotFoundError } from "../errors/NotFoundError";
import { TokenPayload, USER_ROLES, User } from "../models/User";
import { HashManager } from "../services/HashManager";
import { IdGenerator } from "../services/IdGenerator";
import { TokenManager } from "../services/TokenManager";

export class UserBusiness {
  constructor(
    private userDatabase: UserDatabase,
    private idGenerator: IdGenerator,
    private tokenManager: TokenManager,
    private hashManager: HashManager
  ) { }

  public signup = async (input: SignupInputDTO): Promise<SignupOutputDTO> =>{
        
    const {name, email, password} = input

    const id = this.idGenerator.generate()

    const hashedPassword = await this.hashManager.hash(password)

    const user = new User(
        id,
        name, 
        email,
        hashedPassword,
        USER_ROLES.NORMAL,
        new Date().toISOString()
    )
    const userDB = user.toDBModel()
    await this.userDatabase.insertUser(userDB)

        const payLoad: TokenPayload = {
            id: user.getId(),
            name: user.getName(),
            role: user.getRole()
        }

    const result: SignupOutputDTO = {
        token: this.tokenManager.createToken(payLoad)
    }

    return result

}

  public login = async (
    input: LoginInputDTO
  ): Promise<LoginOutputDTO> => {
    const { email, password } = input

    const userDB = await this.userDatabase.findUserByEmail(email)

    if (!userDB) {
      throw new NotFoundError("'email' não encontrado")
    }

    const isPasswordCorrect = await this.hashManager.compare(password,userDB.password)    

    if (!isPasswordCorrect) {
      throw new BadRequestError("'email' ou 'password' incorretos")
    }

    const user = new User(
      userDB.id,
      userDB.name,
      userDB.email,
      userDB.password,
      userDB.role,
      userDB.created_at
    )

    // modelagem do payload do token
    const tokenPayload: TokenPayload = {
      id: user.getId(),
      name: user.getName(),
      role: user.getRole()
    }

    // criação do token
    const token = this.tokenManager.createToken(tokenPayload)

    const output: LoginOutputDTO = {
      message: "Login realizado com sucesso",
      token: token
    }

    return output
  }
}
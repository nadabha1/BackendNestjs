import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateProjetDto } from './dto/create-projet.dto';
import { UpdateProjetDto } from './dto/update-projet.dto';
import { Projet, ProjetDocument } from './entities/projet.entity';
import * as SibApiV3Sdk from 'sib-api-v3-sdk';
import { UserService } from 'src/user/user.service';
import { User } from 'src/user/entities/user.entity';


@Injectable()
export class ProjetService {

  constructor(
    @InjectModel(Projet.name) private readonly projetModel: Model<ProjetDocument>,
    private readonly apiInstance: SibApiV3Sdk.TransactionalEmailsApi,
    private readonly userService: UserService,
  ) { }
  async getfreelancers(): Promise<User[]> {
    return this.userService.findUsersInfoById();
  }
  // Create a new Projet
  async create(createProjetDto: CreateProjetDto): Promise<Projet> {
    // Create a new Projet and save to the database
   
    const users = await this.getfreelancers();

    const createdProjet = new this.projetModel(createProjetDto);  // Use the Projet model
    return await createdProjet.save();  // Save the Projet

    
  }
  

  async sendEmailProjects(to: string, userName: string, message : string): Promise<void> {
    console.log(to);
    const emailData = {
      sender: { email: 'nadabha135@gmail.com', name: 'Admin' },
      to: [{ email: to }],
      subject: 'Noveau Projet ',
      htmlContent: `<h1>Bonjour ${userName},</h1>
                    <p>${message}.</p>`,
    };
  
    try {
      const response = await this.apiInstance.sendTransacEmail(emailData);
      console.log('Email envoyé avec succès :', response);
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email :', error);
      throw new Error('L\'envoi de l\'email a échoué.');
    }
  }
  async findAll(): Promise<Projet[]> {
    return await this.projetModel.find().exec(); // Retrieve all Projets from MongoDB
  }

  async findOne(id: string): Promise<Projet> {
    const projet = await this.projetModel.findById(id).exec();
    if (!projet) {
      throw new NotFoundException('projet with this ID not found');
    }
    return projet;
  }
  async findByUserId(userId: string): Promise<Projet[]> {
    return await this.projetModel.find({ userId }).exec(); // Filter projects by userId
  }


  async findAllByUserId(userId:string): Promise<Projet[]> {
    return await this.projetModel.find({ userId }).exec(); // Retrieve all Projets from MongoDB
  }
  async findOneBy(username: string): Promise<{ id: string }> {
    const projet = await this.projetModel.findOne({ username }).exec();
    
    if (!projet) {
      throw new NotFoundException('Projet with this ID not found');
    }
  
    return { id: projet._id.toString() }; 
  }
  async findOneByUser(username: string): Promise<Projet>  {
    const projet = await this.projetModel.findOne({ username }).exec();
    
    if (!projet) {
      throw new NotFoundException('Projet with this ID not found');
    }
  
    return projet; 
  }

  async update(id: string, updateProjetDto: UpdateProjetDto): Promise<Projet> {
    const updatedProjet = await this.projetModel.findByIdAndUpdate(id, updateProjetDto, { new: true }).exec();
    if (!updatedProjet) {
      throw new NotFoundException('Projet not found');
    }
    return updatedProjet;
  }

  async remove(id: string): Promise<Projet> {
    
    const deletedProjet = await this.projetModel.findByIdAndDelete(id).exec();
    if (!deletedProjet) {
      throw new NotFoundException('Projet not found');
    }
    return deletedProjet;
  }
 
  
}

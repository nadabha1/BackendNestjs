import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Application, ApplicationDocument } from './entities/application.entity';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { User } from 'src/user/entities/user.entity';
import { Projet } from 'src/projet/entities/projet.entity';
import { NotificationService } from 'src/notification/notification.service';
@Injectable()
export class ApplicationService {
  constructor(
    @InjectModel(Application.name) private applicationModel: Model<ApplicationDocument>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Projet.name) private projectModel: Model<Projet>,
    private readonly notificationService: NotificationService, // Inject NotificationService
  ) {}

  async create(createApplicationDto: CreateApplicationDto): Promise<Application> {
    const { freelancer, project, status } = createApplicationDto;

    const freelancerId = new Types.ObjectId(freelancer);
    const projectId = new Types.ObjectId(project);

    const freelancerExists = await this.userModel.findById(freelancerId);
    if (!freelancerExists) {
      throw new NotFoundException('Freelancer not found');
    }

    const projectExists = await this.projectModel.findById(projectId);
    if (!projectExists) {
      throw new NotFoundException('Project not found');
    }

    const application = new this.applicationModel({
      freelancer: freelancerId,
      project: projectId,
      status: status || 'pending',
    });

    const savedApplication = await application.save();

    // Send notification to the entrepreneur
    await this.notificationService.sendNotificationToEntrepreneur(
      projectId.toString(),
      projectExists.userId, // Assuming userId is the entrepreneur's ID
      `${freelancerExists.username} has applied for your project: ${projectExists.title}`
    );

    return savedApplication;
  }


  // Trouver toutes les candidatures
  async findAll(): Promise<Application[]> {
    return this.applicationModel.find().populate('freelancer').populate('project').exec();
  }

  // Trouver une candidature spécifique par ID
  async findOne(id: string): Promise<Application> {
    const application = await this.applicationModel
      .findById(id)
      .populate('freelancer')
      .populate('project')
      .exec();

    if (!application) {
      throw new NotFoundException(`Application with id ${id} not found`);
    }

    return application;
  }

  // Mettre à jour une candidature (changer son statut)
  async update(id: string, updateApplicationDto: UpdateApplicationDto): Promise<Application> {
    const application = await this.applicationModel.findById(id);

    if (!application) {
      throw new NotFoundException(`Application with id ${id} not found`);
    }

    // Mettre à jour les informations de la candidature
    if (updateApplicationDto.status) {
      application.status = updateApplicationDto.status;
    }

    return application.save();
  }

  // Supprimer une candidature
  async remove(id: string): Promise<string> {
    const application = await this.applicationModel.findByIdAndDelete(id).exec();

    if (!application) {
      throw new NotFoundException(`Application with id ${id} not found`);
    }

  return `Application with id ${id} has been removed`;
  }
}

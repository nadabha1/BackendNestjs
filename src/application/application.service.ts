import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Application, ApplicationDocument } from './entities/application.entity';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { User } from 'src/user/entities/user.entity';
import { Projet } from 'src/projet/entities/projet.entity';
import { NotificationService } from 'src/notification/notification.service';
import * as SibApiV3Sdk from 'sib-api-v3-sdk';

@Injectable()
export class ApplicationService {
  constructor(
    @InjectModel(Application.name) private applicationModel: Model<ApplicationDocument>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Projet.name) private projectModel: Model<Projet>,
    private readonly notificationService: NotificationService, // Inject NotificationService
    private readonly apiInstance: SibApiV3Sdk.TransactionalEmailsApi
    
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
      status: status || 'Pending',
    });

    const savedApplication = await application.save();

    // Send notification to the entrepreneur
    await this.notificationService.sendNotificationToEntrepreneur(
      projectId.toString(),
      projectExists.userId, // Assuming userId is the entrepreneur's ID
      freelancerExists.id, //
      `${freelancerExists.username} has applied for your project: ${projectExists.title}`
    );

    return savedApplication;
  }
  async createAvecVerification(createApplicationDto: CreateApplicationDto): Promise<Application> {
    const { freelancer, project, status } = createApplicationDto;
  
    const freelancerId = new Types.ObjectId(freelancer);
    const projectId = new Types.ObjectId(project);
  
    // Vérifier si le freelancer existe
    const freelancerExists = await this.userModel.findById(freelancerId);
    if (!freelancerExists) {
      throw new NotFoundException('Freelancer not found');
    }
  
    // Vérifier si le projet existe
    const projectExists = await this.projectModel.findById(projectId);
    if (!projectExists) {
      throw new NotFoundException('Project not found');
    }
  
    // Vérifier si le freelancer a déjà postulé pour ce projet
    const existingApplication = await this.applicationModel.findOne({
      freelancer: freelancerId,
      project: projectId,
    });
  
    if (existingApplication) {
      throw new HttpException('you have already applied to this project', HttpStatus.BAD_REQUEST);
    }
  
    // Créer une nouvelle candidature
    const application = new this.applicationModel({
      freelancer: freelancerId,
      project: projectId,
      status: status || 'pending',
    });
  
    const savedApplication = await application.save();
  
    // Envoyer une notification à l'entrepreneur
    await this.notificationService.sendNotificationToEntrepreneur(
      projectId.toString(),
      projectExists.userId, // Supposons que userId soit l'ID de l'entrepreneur
      freelancerExists.id, // L'ID du freelancer
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
  async getUsersByProjectId(projectId: string): Promise<any[]> {
    // Recherche des candidatures pour un projet spécifique
    const applications = await this.applicationModel
      .find({ project: projectId }) // Filtrer par projectId
      .populate('freelancer') // Charger les informations du freelance
      .exec();

    // Retourner uniquement les informations des freelances en supprimant les doublons
    const uniqueUsers = [];
    const seenIds = new Set();

    applications.forEach((application) => {
      const freelancer = application.freelancer;
      if (freelancer && !seenIds.has(freelancer._id.toString())) {
        seenIds.add(freelancer._id.toString());
        uniqueUsers.push(freelancer);
      }
    });

    return uniqueUsers;
  }
  // Service pour rechercher le statut de l'application
  async getApplicationStatus(freelancerId: string, projectId: string): Promise<string> {
    console.log('Searching for:', freelancerId, projectId);
  
    const application = await this.applicationModel.findOne({
      freelancer: new Types.ObjectId(freelancerId),
      project: new Types.ObjectId(projectId),
    });
  
    if (!application) {
      console.error(`No application found for freelancer ${freelancerId} and project ${projectId}`);
      throw new Error('Application not found');
    }


  
    return application.status;
  }
  

  async getProjectFromApplication(freelancerId: string): Promise<any[]> {
    // Recherche des candidatures pour un projet spécifique
    const applications = await this.applicationModel
      .find({ freelancer: freelancerId }) // Filtrer par freelancerId
      .populate('project') // Charger les informations du freelance
      .exec();

    // Retourner uniquement les projets sans la propriété "applications" et supprimer les doublons
    const uniqueUsers = [];
    const seenIds = new Set();

    applications.forEach((application) => {
      const project = application.project;
      if (project && !seenIds.has(project._id.toString())) {
        seenIds.add(project._id.toString());
        const { applications, ...projectWithoutApplications } = project.toObject(); // Supprimer la propriété "applications"
        uniqueUsers.push(projectWithoutApplications);
      }
    });

    return uniqueUsers;
}

  async updateStatus(applicationId: string, status: string): Promise<Application> {
    const application = await this.applicationModel.findByIdAndUpdate(
      applicationId,
      { status },
      { new: true } // Retourne la candidature mise à jour
    );

    if (!application) {
      throw new NotFoundException('Application not found');
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


  // Méthode pour accepter une candidature
  async acceptApplication(freelancerId: string, projectId: string): Promise<Application> {
    // Recherche de l'application par freelancerId et projectId
    const application = await this.applicationModel.findOne({
      freelancer: freelancerId,
      project: projectId,
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    // Mise à jour du statut en "accepted"
    application.status = 'Accepted';
    await application.save(); // Sauvegarde de la mise à jour

    const freelancer = await this.userModel.findById(freelancerId);
    const project = await this.projectModel.findById(projectId);

    if (freelancer && project) {
      await this.sendApplicationNotification(
        freelancer.email, // Assuming `email` is a property of `User`
        freelancer.username,
        'Accepted',
        project.title,
      );
    }

    return application; // Retourne l'application mise à jour
  }

  // Méthode pour rejeter une candidature
  async rejectApplication(freelancerId: string, projectId: string): Promise<Application> {
    // Recherche de l'application par freelancerId et projectId
    const application = await this.applicationModel.findOne({
      freelancer: freelancerId,
      project: projectId,
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    // Mise à jour du statut en "rejected"
    application.status = 'Rejected';
    await application.save(); // Sauvegarde de la mise à jour

    const freelancer = await this.userModel.findById(freelancerId);
    const project = await this.projectModel.findById(projectId);

    if (freelancer && project) {
      await this.sendApplicationNotification(
        freelancer.email, // Assuming `email` is a property of `User`
        freelancer.username,
        'Rejected',
        project.title,
      );
    }

    return application; // Retourne l'application mise à jour
  }
  async sendApplicationNotification(to: string, userName: string, status: string, projectTitle: string): Promise<void> {
    const emailData = {
      sender: { email: 'nadabha135@gmail.com', name: 'Admin' },
      to: [{ email: to }],
      subject: `Application Result `,
      htmlContent: `<h1>Hello ${userName},</h1>
                    <p>Your application for the project <b>${projectTitle}</b> has been <b>${status.toLowerCase()}</b>.</p>
                    <p>If you have any questions, feel free to contact us at freelancy@esprit.com.</p>`,
    };

    try {
      const response = await this.apiInstance.sendTransacEmail(emailData);
      console.log('Email sent successfully:', response);
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Email sending failed.');
    }
  }

}

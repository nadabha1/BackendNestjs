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
import { Task } from 'src/task/entities/task.entity';

@Injectable()
export class ApplicationService {
  constructor(
    @InjectModel(Application.name) private applicationModel: Model<ApplicationDocument>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Projet.name) private projectModel: Model<Projet>,
    @InjectModel(Task.name) private taskModel: Model<Task>,
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
  async getApplicationsByFreelancer(freelancerId: string) {
    return this.applicationModel.find({ freelancer: freelancerId }).populate('project');
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




  


  async getUsersByProjectId1(projectId: string): Promise<any[]> {
    // Recherche des candidatures pour un projet spécifique
    const applications = await this.applicationModel
      .find({ project: projectId }) // Filtrer par projectId
      .populate('freelancer') // Charger les informations du freelance
      .exec();
  
    // Retourner uniquement les informations des freelances et le status de l'application, en supprimant les doublons
    const uniqueUsers = [];
    const seenIds = new Set();
  
    applications.forEach((application) => {
      const freelancer = application.freelancer;
      if (freelancer && !seenIds.has(freelancer._id.toString())) {
        seenIds.add(freelancer._id.toString());
        
        // Ajouter un objet contenant les informations du freelance et le status de l'application
        uniqueUsers.push({
          id:application.id,
          username: freelancer.username,
          email: freelancer.email,
          skills: freelancer.skills,
          status: application.status
        });
      }
    });
  
    return uniqueUsers;
  }
  // Service pour rechercher le statut de l'application



  // Mettre à jour une candidature (changer son statut)
  // Supprimer une candidature


 

  // Méthode pour rejeter une candidature
  
  async getAcceptedApplications(): Promise<any[]> { 
    
    const acceptedApplications = await this.applicationModel
        .find({ status: 'Accepted' })
        .populate('freelancer', 'username email skills') // Populates freelancer details
        .populate('project', 'title') // Populates freelancer details

        .exec();

    return acceptedApplications.map((app) => ({
        id: app._id,
        iduser: app.freelancer.id,
        title:app.project.title,
        username: app.freelancer.username,
        email: app.freelancer.email,
        skills: app.freelancer.skills || '',
        status: app.status,
    }));
}
async getApplicationById(appId: string): Promise<{ freelancer: string; project: string }> {
  const application = await this.applicationModel
    .findById(appId)
    .populate('freelancer', '_id') // Ensure the freelancer field is populated with only the ID
    .populate('project', '_id')    // Ensure the project field is populated with only the ID
    .exec();

  if (!application) {
    throw new NotFoundException('Application not found');
  }

  return {
    freelancer: application.freelancer?._id?.toString(), // Convert to string if necessary
    project: application.project?._id?.toString(),       // Convert to string if necessary
  };
}
async getTasksByProject(projectId: string): Promise<Task[]> {
  return this.taskModel.find({ projet: projectId }).exec(); // Ensure projet is used as the field name
}




   
async getAcceptedProjectsForFreelancer(freelancerId: string): Promise<any[]> {
  // Fetch applications for the freelancer where status is "Accepted"
  const applications = await this.applicationModel
    .find({ freelancer: freelancerId, status: 'Accepted' }) // Filter by freelancerId and status
    .populate('project') // Populate project details
    .exec();

  // Return unique projects without including application data
  const uniqueProjects = [];
  const seenIds = new Set();

  applications.forEach((application) => {
    const project = application.project;
    if (project && !seenIds.has(project._id.toString())) {
      seenIds.add(project._id.toString());
      const { applications, ...projectWithoutApplications } = project.toObject();
      uniqueProjects.push(projectWithoutApplications);
    }
  });

  return uniqueProjects;
}


async getActiveProjectsForEntrepreneur(entrepreneurId: string): Promise<any[]> {
  // Fetch all projects created by the entrepreneur
  const projects = await this.projectModel.find({ userId: entrepreneurId }).exec();

  if (!projects.length) {
      throw new NotFoundException('projects found for entrepreneur with ID ${entrepreneurId}');
  }

  // Filter projects where at least one freelancer has been accepted
  const activeProjects = [];

  for (const project of projects) {
      const acceptedApplications = await this.applicationModel
          .find({ project: project._id, status: 'Accepted' }) // Filter accepted applications
          .populate('freelancer') // Include freelancer details if needed
          .exec();

      if (acceptedApplications.length > 0) {
          const projectData = {
              ...project.toObject(),
              acceptedFreelancers: acceptedApplications.map(app => app.freelancer), // Add acceptedFreelancers dynamically
          };
          activeProjects.push(projectData);
      }
  }

  return activeProjects;
}



async getApplicationsCountByUser(userId: string): Promise<any[]> {
  try {
    // Ensure userId is correctly converted
    const userObjectId = new Types.ObjectId(userId);

    const result = await this.applicationModel.aggregate([
      // Add fields to ensure project is an ObjectId
      {
        $addFields: {
          project: { $toObjectId: '$project' },
        },
      },
      // Join with the projets collection
      {
        $lookup: {
          from: 'projets',
          localField: 'project',
          foreignField: '_id',
          as: 'projectDetails',
        },
      },
      // Match projects that belong to the provided userId
      {
        $match: {
          'projectDetails.userId': userObjectId,
        },
      },
      // Unwind the projectDetails array
      {
        $unwind: {
          path: '$projectDetails',
          preserveNullAndEmptyArrays: false,
        },
      },
      // Group applications by project and count them
      {
        $group: {
          _id: '$project',
          count: { $sum: 1 },
          projectDetails: { $first: '$projectDetails' },
        },
      },
      // Project the final structure
      {
        $project: {
          projectId: '$_id',
          projectTitle: '$projectDetails.title',
          applicationCount: '$count',
        },
      },
    ]);

    console.log('Aggregation Result:', result);
    return result;
  } catch (error) {
    console.error('Error in getApplicationsCountByUser:', error.message);
    throw new Error('Failed to get applications count by user');
  }
}

}

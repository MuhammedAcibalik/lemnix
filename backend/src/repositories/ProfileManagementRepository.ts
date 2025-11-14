import { BaseRepository } from "./BaseRepository";

export class ProfileManagementRepository extends BaseRepository {
  private static instance: ProfileManagementRepository;

  private constructor() {
    super();
  }

  public static getInstance(): ProfileManagementRepository {
    if (!ProfileManagementRepository.instance) {
      ProfileManagementRepository.instance = new ProfileManagementRepository();
    }

    return ProfileManagementRepository.instance;
  }
}

export const profileManagementRepository =
  ProfileManagementRepository.getInstance();

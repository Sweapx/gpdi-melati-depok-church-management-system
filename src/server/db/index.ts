import bcrypt from 'bcrypt';
import dotenv from "dotenv";
import { Pool } from 'pg';
import { 
  AdminUser, AnnouncementItem, CertificateDoc, HeroSlide, 
  Jemaat, KnowledgeBaseQA, PrayerRequest, RegistrationItem, 
  ScheduleItem, WartaItem 
} from "../../types/index.ts";

dotenv.config();

// In-Memory Storage Fallback
class InMemoryStore {
  adminUsers: AdminUser[] = [];
  announcements: AnnouncementItem[] = [];
  certificates: CertificateDoc[] = [];
  certificateRequests: any[] = [];
  heroSlides: HeroSlide[] = [];
  jemaat: Jemaat[] = [];
  knowledgeBase: KnowledgeBaseQA[] = [];
  prayerRequests: PrayerRequest[] = [];
  registrations: RegistrationItem[] = [];
  schedules: ScheduleItem[] = [];
  wartaJemaat: WartaItem[] = [];

  constructor() {
    // Don't call async seed in constructor
    this.seedDefaultAdmin();
  }

  seedDefaultAdmin() {
    // Seed admin user only - required for login functionality
    if (this.adminUsers.length === 0) {
      const passwordHash = bcrypt.hashSync('admin123', 10);
      this.adminUsers.push({
        id: 'admin-1',
        username: 'admin',
        passwordHash: passwordHash,
        name: 'Super Admin',
        role: 'admin',
        mustChangePassword: false,
        createdAt: new Date().toISOString()
      } as any);
    }
  }
}

export const inMemoryDB = new InMemoryStore();
export const usePostgres = !!process.env.DATABASE_URL;

export const pool = usePostgres ? new Pool({
  connectionString: process.env.DATABASE_URL,
}) : null;

if (pool) {
  console.log("Using PostgreSQL Database");
} else {
  console.log("Using In-Memory Database Fallback");
}

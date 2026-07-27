import { Pool } from "pg";
import dotenv from "dotenv";
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
    this.seedDefaultAdmin();
  }

  seedDefaultAdmin() {
    // We will hash this in the auth route or here directly if possible, 
    // but typically we'll insert a pre-hashed admin password. 
    // For now we'll do it in the auth controller initialization if missing.
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

// Custom types for our database tables
export interface Profile {
  id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  role: "job-seeker" | "employer";
  bio?: string;
  skills?: string[];
  experience?: string;
  resume_url?: string;
  company_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Company {
  id: string;
  name: string;
  description?: string;
  industry?: string;
  size?: string;
  website?: string;
  logo_url?: string;
  location?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  requirements?: string;
  location?: string;
  salary_range?: string;
  type?: string;
  remote?: boolean;
  category?: string;
  skills?: string[];
  company_id: string;
  status: string;
  expires_at?: string;
  created_by: string;
  created_at?: string;
  updated_at?: string;
}

export interface Application {
  id: string;
  job_id: string;
  applicant_id: string;
  status: string;
  cover_letter?: string;
  resume_url?: string;
  feedback?: string;
  created_at?: string;
  updated_at?: string;
}

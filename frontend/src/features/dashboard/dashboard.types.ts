export type DashboardStats = {
  users: {
    total: number;
    active: number;
    admin: number;
  };
  companies: {
    total: number;
    published: number;
    draft: number;
    archived: number;
  };
  services: {
    total: number;
    active: number;
  };
  projects: {
    total: number;
    published: number;
    featured: number;
    ongoing: number;
    completed: number;
  };
  gallery: {
    total: number;
    published: number;
  };
  news: {
    total: number;
    published: number;
  };
  careers: {
    jobs: number;
    openJobs: number;
    applications: number;
    newApplications: number;
  };
  inquiries: {
    total: number;
    new: number;
  };
  team: {
    total: number;
    active: number;
  };
  socialLinks: {
    total: number;
  };
  settings: {
    total: number;
  };
};

export type RecentInquiry = {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string | null;
  subject: string;
  status: string;
  createdAt: string;
};

export type RecentApplication = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  status: string;
  createdAt: string;
  job: {
    id: string;
    title: string;
    slug: string;
    company: {
      id: string;
      name: string;
      slug: string;
    };
  };
  preferredCompany: {
    id: string;
    name: string;
    slug: string;
  } | null;
};

export type RecentProject = {
  id: string;
  name: string;
  slug: string;
  status: string;
  publishStatus: string;
  featured: boolean;
  createdAt: string;
  company: {
    id: string;
    name: string;
    slug: string;
  };
};

export type RecentNews = {
  id: string;
  title: string;
  slug: string;
  status: string;
  publishedAt: string | null;
  createdAt: string;
  author: {
    id: string;
    name: string;
    email: string;
  } | null;
};

export type DashboardOverview = {
  stats: DashboardStats;
  recentActivity: {
    inquiries: RecentInquiry[];
    applications: RecentApplication[];
    projects: RecentProject[];
    news: RecentNews[];
  };
};

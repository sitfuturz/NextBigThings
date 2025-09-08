export interface Webinar {
  _id: string;
  title: string;
  description: string;
  topic: string;
  host: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  hostName: string;
  date: string;
  startTime: string;
  endTime: string;
  thumbnail: string;
  bannerImage: string;
  zoomLink: string;
  zoomMeetingId: string;
  zoomPasscode: string;
  accessType: 'free' | 'paid';
  price: number;
  maxCapacity: number;
  streamingUrl: string;
  streamingTech: 'webrtc' | 'hls';
  registeredUsers: {
    userId: {
      _id: string;
      name: string;
      email: string;
      mobile_number: string;
    };
    userType: 'entrepreneur' | 'company_employee' | 'client';
    registeredAt: string;
    hasPaid: boolean;
    paymentAmount: number;
  }[];
  liveAttendees: {
    userId: {
      _id: string;
      name: string;
      email: string;
    };
    joinedAt: string;
    leftAt: string | null;
  }[];
  isRecorded: boolean;
  recordingUrl: string;
  recordingStatus: 'not_recorded' | 'recording' | 'processing' | 'ready';
  recordingRequests: {
    userId: string;
    requestedAt: string;
    status: 'pending' | 'approved' | 'rejected';
    approvedBy: string | null;
    approvedAt: string | null;
  }[];
  attendanceQRCode: string;
  qrCodeAttendance: {
    userId: string;
    scannedAt: string;
  }[];
  status: 'scheduled' | 'live' | 'completed' | 'cancelled';
  isActive: boolean;
  allowChat: boolean;
  allowQA: boolean;
  category: string;
  postSessionFiles: {
    fileName: string;
    fileUrl: string;
    fileType: string;
  }[];
  assignedBatch: string;
  createdAt: string;
  updatedAt: string;
  totalRegistrations: number;
  currentLiveCount: number;
}

export interface WebinarResponse {
  docs: Webinar[];
  totalDocs: number;
  limit: number;
  page: number;
  totalPages: number;
  pagingCounter: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: number | null;
  nextPage: number | null;
}

export interface WebinarAnalytics {
  webinarInfo: {
    title: string;
    date: string;
    status: string;
  };
  registrations: {
    total: number;
    entrepreneurs: number;
    companyEmployees: number;
    clients: number;
  };
  attendance: {
    totalAttendees: number;
    currentlyLive: number;
    qrScans: number;
  };
  recordings: {
    isRecorded: boolean;
    recordingRequests: number;
    approvedRequests: number;
  };
}

export interface CreateWebinarData {
  title: string;
  description?: string;
  topic?: string;
  host: string;
  hostName?: string;
  date: string;
  startTime: string;
  endTime: string;
  thumbnail?: string;
  bannerImage?: string;
  zoomLink: string;
  zoomMeetingId?: string;
  zoomPasscode?: string;
  accessType?: 'free' | 'paid';
  price?: number;
  maxCapacity?: number;
  streamingTech?: 'webrtc' | 'hls';
  allowChat?: boolean;
  allowQA?: boolean;
  category?: string;
  assignedBatch?: string;
}

export interface UpdateWebinarData {
  webinarId: string;
  title?: string;
  description?: string;
  topic?: string;
  host?: string;
  hostName?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  thumbnail?: string;
  bannerImage?: string;
  zoomLink?: string;
  zoomMeetingId?: string;
  zoomPasscode?: string;
  accessType?: 'free' | 'paid';
  price?: number;
  maxCapacity?: number;
  streamingTech?: 'webrtc' | 'hls';
  allowChat?: boolean;
  allowQA?: boolean;
  category?: string;
  assignedBatch?: string;
}

export interface StartStreamingData {
  streamingUrl: string;
}

export interface ApproveRecordingData {
  status: 'approved' | 'rejected';
  adminNotes?: string;
}
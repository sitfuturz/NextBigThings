import { environment } from '../../../env/env.local';

class ApiEndpoints {
  private PATH: string = `${environment.baseURL}/${environment.route}`;
  private PATH1: string = `${environment.baseURL}`;

  // ==================== AUTHENTICATION ====================
  public ADMIN_LOGIN: string = `${this.PATH}/login`;
  public FORGOT_PASSWORD: string = `${this.PATH}/forgotPassword`;
  public UPDATE_PASSWORD: string = `${this.PATH}/VerifyCode`;

  // ==================== USER MANAGEMENT ====================
  public GET_USERS: string = `${this.PATH}/users`;
  public UPDATE_USER: string = `${this.PATH}/updateUser`;
  public UPDATE_USER_STATUS: string = `${this.PATH}/isActiveStatus`;
  public TOGGLE_USER_STATUS: string = `${this.PATH}/isActiveStatus`;
  public DELETE_USER: string = `${this.PATH}/users/delete`;
  public GET_USER_DETAILS: string = `${this.PATH}/details`;
  public IMPORT_USERS: string = `${this.PATH}/import`;
  public REGISTER_USER: string = `${this.PATH1}/admin/register`;
  public SEND_NOTIFICATION_T0_USER = `${this.PATH}/sendNotificationToUser`;

  // ==================== APPLICATIONS & REGISTRATIONS ====================
  public GET_ALL_APPLICATIONS: string = `${this.PATH1}/users/applications`;
  public GET_ALL_APPLICATIONS1: string = `${this.PATH1}/users/getActiveApplications1`;
  public EDIT_APPLICATION: string = `${this.PATH1}/users/editApplication`;
  public CONVERT_TO_USER: string = `${this.PATH}/convert-to-user`;
  public GET_ALL_EVENT_REGISTRATIONS: string = `${this.PATH1}/users/getEventRegistrations`;

  // ==================== GEOGRAPHY MANAGEMENT ====================
  // Countries
  public GET_ALL_COUNTRIES: string = `${this.PATH}/getAllCountries`;
  public CREATE_COUNTRY: string = `${this.PATH}/createCountry`;
  public UPDATE_COUNTRY: string = `${this.PATH}/updateCountry`;
  public GET_COUNTRY_BY_ID: string = `${this.PATH}/getCountryById`;
  public DELETE_COUNTRY: string = `${this.PATH}/deleteCountry`;

  // States
  public GET_ALL_STATES: string = `${this.PATH}/getAllStates`;
  public CREATE_STATE: string = `${this.PATH}/createState`;
  public UPDATE_STATE: string = `${this.PATH}/updateState`;
  public GET_STATE_BY_ID: string = `${this.PATH}/getStateById`;
  public DELETE_STATE: string = `${this.PATH}/deleteState`;

  // Cities
  public GET_ALL_CITIES: string = `${this.PATH}/getCities`;
  public CREATE_CITY: string = `${this.PATH}/createCity`;
  public UPDATE_CITY: string = `${this.PATH}/updateCity`;
  public GET_CITY_BY_ID: string = `${this.PATH}/getCityById`;
  public DELETE_CITY: string = `${this.PATH}/deleteCity`;

  // ==================== CHAPTER MANAGEMENT ====================
  public GET_ALL_CHAPTERS: string = `${this.PATH}/getChapters`;
  public CREATE_CHAPTER: string = `${this.PATH}/createChapter`;
  public UPDATE_CHAPTER: string = `${this.PATH}/updateChapter`;
  public GET_CHAPTER_BY_ID: string = `${this.PATH}/getChapterById`;
  public DELETE_CHAPTER: string = `${this.PATH}/deleteChapter`;
  public GET_CHAPTER_BY_CITY: string = `${this.PATH}/getChapterByCity`;
  public GET_COUNTS_BY_CHAPTER: string = `${this.PATH}/getCountsByChapter`;
  public USER_BY_CHAPTER: string = `${this.PATH}/userListByParticularChapter`;

  // ==================== CATEGORIES & SUBCATEGORIES ====================
  // Categories
  public GET_CATEGORIES: string = `${this.PATH}/getCategories`;
  public CREATE_CATEGORY: string = `${this.PATH}/createCategory`;
  public UPDATE_CATEGORY: string = `${this.PATH}/updateCategory`;
  public GET_CATEGORY_BY_ID: string = `${this.PATH}/getCategoryById`;
  public DELETE_CATEGORY: string = `${this.PATH}/deleteCategory`;

  // Subcategories
  public GET_SUBCATEGORIES: string = `${this.PATH}/getSubCategories`;
  public CREATE_SUBCATEGORY: string = `${this.PATH}/createSubCategory`;
  public UPDATE_SUBCATEGORY: string = `${this.PATH}/updateSubCategory`;
  public DELETE_SUBCATEGORY: string = `${this.PATH}/deleteSubCategory`;

  // ==================== EVENT MANAGEMENT ====================
  public GET_ALL_EVENTS: string = `${this.PATH}/getAllEvents`;
  public CREATE_EVENT: string = `${this.PATH}/createEvent`;
  public UPDATE_EVENT: string = `${this.PATH}/updateEvent`;
  public DELETE_EVENT: string = `${this.PATH}/deleteEvent`;
  public GET_EVENTS_BY_CHAPTER: string = `${this.PATH}/getEventByChapter`;

  // Event Media
  public ADD_PHOTOS_TO_EVENT: string = `${this.PATH}/events`;
  public ADD_VIDEOS_TO_EVENT: string = `${this.PATH}/events`;
  public GET_EVENT_GALLERY: string = `${this.PATH}/getEventGallery`;

  // Event Participation
  public GET_ALL_PARTICIPANTS: string = `${this.PATH}/getAllParticipant`;

  // ==================== ATTENDANCE MANAGEMENT ====================
  public GET_ALL_ATTENDANCE: string = `${this.PATH}/getAllAttendance`;
  public GET_ATTENDANCE_RECORDS: string = `${this.PATH}/getAttendanceRecords`;
  public TOGGLE_ATTENDANCE_STATUS: string = `${this.PATH}/toggleAttendanceStatus`;
  public DELETE_ATTENDANCE: string = `${this.PATH}/deleteAttendance/:attendanceId`;

  // ==================== VISITOR MANAGEMENT ====================
  public GET_ALL_VISITORS: string = `${this.PATH}/getAllVisitors`;
  public CREATE_VISITOR: string = `${this.PATH}/createVisitor`;
  public UPDATE_VISITOR: string = `${this.PATH}/updateVisitor`;
  public TOGGLE_VISITOR_ATTENDANCE: string = `${this.PATH}/toggleVisitorAttendance`;

  // ==================== REFERRAL SYSTEM ====================
  public GET_ALL_REFERRALS: string = `${this.PATH}/referrals/`;
  public GET_ALL_REFERRALS_RECIEVED: string = `${this.PATH}/referrals/received`;
  public REFERRAL_GIVEN: string = `${this.PATH}/referrals/given`;
  public REFERRAL_RECEIVED: string = `${this.PATH}/referrals/received`;

  // ==================== ONE-TO-ONE MEETINGS ====================
  public GET_ALL_ONE_TO_ONE: string = `${this.PATH}/oneToOnes/getAllOneToOne`;

  // ==================== TESTIMONIALS ====================
  public GET_ALL_TESTIMONIALS: string = `${this.PATH}/testimonials/`;

  // ==================== TYFCB (Thank You For Closed Business) ====================
  public GET_ALL_TYFCBS: string = `${this.PATH}/getAllTyfcb`;

  // ==================== ASK & LEADS ====================
  public GET_ALL_ASK: string = `${this.PATH1}/mobile/getAllAsksForAdmin`;

  // ==================== LEADERBOARD & POINTS ====================
  public GET_ALL_LEADERBOARDS: string = `${this.PATH}/getAllLeaderboards`;
  public CREATE_LEADERBOARD: string = `${this.PATH}/createLeaderboard`;
  public UPDATE_LEADERBOARD: string = `${this.PATH}/updateLeaderboard`;
  public GET_LEADERBOARD_BY_ID: string = `${this.PATH}/getLeaderboardById`;
  public DELETE_LEADERBOARD: string = `${this.PATH}/deleteLeaderboard`;

  // Points History
  public GET_POINT_HISTORY: string = `${this.PATH}/getPointsHistory`;
  public GET_ALL_POINTS_HISTORY: string = `${this.PATH}/getAllPointsHistory`;

  // ==================== BANNER MANAGEMENT ====================
  public GET_ALL_BANNER: string = `${this.PATH}/getAllBanner`;
  public BANNER_CREATE: string = `${this.PATH}/bannerCreate`;
  public BANNER_UPDATE: string = `${this.PATH}/bannerUpdate`;
  public GET_BANNER_BY_ID: string = `${this.PATH}/banners`;
  public DELETE_BANNER: string = `${this.PATH}/bannerdelete`;

  // ==================== BADGE MANAGEMENT ====================
  public GET_ALL_BADGES: string = `${this.PATH}/getAllBadges`;
  public CREATE_BADGE: string = `${this.PATH}/createBadge`;
  public UPDATE_BADGE: string = `${this.PATH}/updateBadges`;
  public DELETE_BADGE: string = `${this.PATH}/deleteBadge`;
  public GET_ALL_USERS_BADGES = `${this.PATH}/getAllBadgesUsers`;
  public ASSIGN_BADGE: string = `${this.PATH}/assignBadge`;
  public UNASSIGN_BADGE: string = `${this.PATH}/unassignBadge`;

  // ==================== PODCAST MANAGEMENT ====================
  // Podcast CRUD
  public GET_All_PODCAST = `${this.PATH}/getAllPodcasts`;
  public CREATE_PODCAST: string = `${this.PATH}/createPodcast`;
  public UPDATE_PODCAST = `${this.PATH}/updatePodcast`;
  public DELETE_PODCAST = `${this.PATH}/deletePodcast`;
  public GET_UPCOMING_PODCASTS = `${this.PATH}/getUpcomingPodcasts`;

  // Slot Management
  public GET_AVAILABLE_SLOTS = `${this.PATH}/getAvailableSlots`;
  public GET_ALL_SLOTS = `${this.PATH}/getAllSlots`;
  public GENERATE_SLOTS = `${this.PATH}/generateSlots`;
  public UPDATE_SLOT = `${this.PATH}/updateSlot`;
  public DELETE_SLOT = `${this.PATH}/deleteSlot`;
  public BULK_DELETE_SLOTS = `${this.PATH}/bulkDeleteSlots`;
  public SLOT_BY_PODCASTID = `${this.PATH}/getSlotByPodcastId`;

  // Booking Management
  public BOOKING_BY_PODCASTID = `${this.PATH}/bookingByPodcastId`;
  public REQUEST_BOOKING = `${this.PATH}/requestBooking`;
  public STATUS_UPDATE_BOOKING = `${this.PATH}/statusUpdateBooking`;
  public GET_ALL_BOOKINGS_BY_USER = `${this.PATH}/getAllBookingsByUserId`;
  public GET_COMPLETED_BOOKING_STATS = `${this.PATH}/getCompletedBookingStats`;

  // ==================== FINANCIAL MANAGEMENT ====================
  // Collections
  public ADD_COLLECTION = `${this.PATH}/addCollection`;
  public GET_COLLECTION_HISTORY = `${this.PATH}/getCollectionHistory`;
  public REMOVE_LAST_COLLECTION = `${this.PATH}/removeLastCollection`;

  // Expenses
  public ADD_EXPENSE = `${this.PATH}/add-expense`;
  public UPDATE_EXPENSE = `${this.PATH}/update-expense`;
  public DELETE_EXPENSE = `${this.PATH}/delete-expense`;
  public GET_EXPENSE_BY_ID = `${this.PATH}/getExpenseById`;
  public GET_CHAPTER_FINANCE_SUMMARY = `${this.PATH}/getChapterFinanceSummary`;

  // Fee Management
  public GET_ALL_USERS_FEE: string = `${this.PATH}/getAllFeesUsers`;
  public UPDATE_FEE: string = `${this.PATH}/Feeupdate`;

  // ==================== ANALYTICS & REPORTING ====================
  public GET_DASHBOARD_COUNTS: string = `${this.PATH}/getdata/counts`;
  public GET_ANALYTICS_BY_DATE_RANGE = `${this.PATH}/getAnalyticsByDateRange`;

  // ==================== SYSTEM & UTILITIES ====================
  public GET_OTP: string = `${this.PATH}/getOtpRecords`;
}

export let apiEndpoints = new ApiEndpoints();
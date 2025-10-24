// ============================================
// BACKEND CHANGES NEEDED FOR SESSION VIDEO URLS
// ============================================

// 1. SESSION SCHEMA - No changes needed!
// ============================================
// The existing 'videos' field already supports both file paths and URLs
const sessionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: "" },
  url: { type: String, required: true },
  thumbnail: { type: String, default: "" },
  files: [{ type: String }],
  videos: [{ type: String }], // This field handles BOTH uploaded files and URLs
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
  isPremium: { type: Boolean, default: false },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: true },
  date: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
},{timestamps:true});


// 2. UPDATED CREATE SESSION CONTROLLER
// ============================================
const createSession = asyncHandler(async (req, res) => {
  const { title, description, categoryId, isPremium, date, startTime, endTime, url } = req.body;

  // Handle file uploads
  let thumbnail = "";
  let files = [];
  let videos = [];

  if (req.files) {
    if (req.files.thumbnail && req.files.thumbnail[0]) {
      thumbnail = req.files.thumbnail[0].path.replace(/\\/g, "/");
    }
    if (req.files.files) {
      files = req.files.files.map(file => file.path.replace(/\\/g, "/"));
    }
    if (req.files.videos) {
      // Video files uploaded
      videos = req.files.videos.map(file => file.path.replace(/\\/g, "/"));
    }
  }

  // Handle video URLs from request body (same 'videos' field)
  // If no video files but 'videos' in body, treat them as URLs
  // req.body.videos will be an array of strings if multiple URLs provided
  if (req.body.videos && Array.isArray(req.body.videos)) {
    if (videos.length === 0) {
      // No video files uploaded, so 'videos' are URLs
      videos = req.body.videos.filter(url => url && url.trim() !== '').map(url => url.trim());
    }
  } else if (req.body.videos && typeof req.body.videos === 'string' && req.body.videos.trim() !== '') {
    if (videos.length === 0) {
      // Single URL provided
      videos.push(req.body.videos.trim());
    }
  }

  // Validate categoryId
  const category = await models.Category.findById(categoryId);
  if (!category) {
    return response.notFound("Category not found!", res);
  }

  // Validate startTime and endTime
  if (startTime && endTime) {
    const startDateTime = new Date(`${date}T${startTime}:00`);
    const endDateTime = new Date(`${date}T${endTime}:00`);
    if (startDateTime >= endDateTime) {
      return response.error("End time must be after start time on the same date!", res);
    }
  }

  const session = await models.Session.create({
    title,
    description: description || "",
    url: url || "",
    categoryId,
    isPremium: isPremium || false,
    uploadedBy: req.user._id,
    date,
    startTime,
    endTime,
    thumbnail,
    files,
    videos,
  });

  return response.success("Session created successfully!", { session }, res);
});


// 3. UPDATED UPDATE SESSION CONTROLLER
// ============================================
const updateSession = asyncHandler(async (req, res) => {
  const { sessionId, title, description, categoryId, isPremium, date, startTime, endTime, url } = req.body;

  // Validate categoryId if provided
  if (categoryId) {
    const category = await models.Category.findById(categoryId);
    if (!category) {
      return response.notFound("Category not found!", res);
    }
  }

  // Validate startTime and endTime if both provided
  if (startTime && endTime && date) {
    const startDateTime = new Date(`${date}T${startTime}:00`);
    const endDateTime = new Date(`${date}T${endTime}:00`);
    if (startDateTime >= endDateTime) {
      return response.error("End time must be after start time on the same date!", res);
    }
  }

  // Handle file uploads
  let updateData = { title, description, categoryId, isPremium, date, startTime, endTime, url };
  
  if (req.files) {
    if (req.files.thumbnail && req.files.thumbnail[0]) {
      updateData.thumbnail = req.files.thumbnail[0].path.replace(/\\/g, "/");
    }
    if (req.files.files) {
      updateData.files = req.files.files.map(file => file.path.replace(/\\/g, "/"));
    }
    if (req.files.videos) {
      // Video files uploaded
      updateData.videos = req.files.videos.map(file => file.path.replace(/\\/g, "/"));
    }
  }

  // Handle video URLs from request body (same 'videos' field)
  // If no video files but 'videos' in body, treat them as URLs
  if (req.body.videos && Array.isArray(req.body.videos)) {
    if (!updateData.videos || updateData.videos.length === 0) {
      // No video files uploaded, so 'videos' are URLs
      updateData.videos = req.body.videos.filter(url => url && url.trim() !== '').map(url => url.trim());
    }
  } else if (req.body.videos && typeof req.body.videos === 'string' && req.body.videos.trim() !== '') {
    if (!updateData.videos || updateData.videos.length === 0) {
      // Single URL provided
      updateData.videos = [req.body.videos.trim()];
    }
  }

  const session = await models.Session.findOneAndUpdate(
    { _id: sessionId },
    { $set: updateData },
    { new: true }
  );

  if (!session) {
    return response.notFound("Session not found!", res);
  }

  return response.success("Session updated successfully!", { session }, res);
});


// 4. UPDATED GET SESSIONS CONTROLLER (No changes needed, but including for reference)
// ============================================
const getSessions = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, categoryId, isPremium, date } = req.body;

  const query = {};
  if (categoryId) {
    query.categoryId = categoryId;
  }
  if (isPremium !== undefined && isPremium != null) {
    query.isPremium = isPremium;
  }
  if (date) {
    query.date = { $gte: new Date(date), $lte: new Date(date) };
  }

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sort: { date: -1, startTime: -1 },
    populate: [
      { path: 'categoryId', select: 'name' },
      { path: 'uploadedBy', select: 'name email' },
    ],
  };

  const sessions = await models.Session.paginate(query, options);

  return response.success("Sessions fetched successfully!", sessions, res);
});


// ============================================
// NOTES:
// ============================================
// 1. The frontend will send in the 'videos' field EITHER:
//    - Multiple video files (via req.files.videos) OR
//    - One or more video URLs (via req.body.videos as array or string)
//
// 2. The same 'videos' field in the database stores both file paths and URLs as strings
//
// 3. No schema changes needed - the existing videos array field handles both
//
// 4. The multer configuration doesn't need to change
//
// 5. Backend logic checks:
//    - If req.files.videos exists -> file upload (store file paths)
//    - If req.body.videos is an array -> multiple URLs (store all URLs)
//    - If req.body.videos is a string -> single URL (store URL)
//    - Priority: Files take precedence over URLs if both somehow exist
//
// 6. This approach allows multiple uploads AND multiple URLs
// ============================================

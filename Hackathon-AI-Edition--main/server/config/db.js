const mongoose = require("mongoose");

// Register all models
require("../models/User");
require("../models/Course");
require("../models/Task");
require("../models/StudyBlock");
require("../models/Quiz");
require("../models/ProductivityLog");

const connectDB = async () => {
  mongoose.set("bufferCommands", false);

  try {
    const mongoUri =
      process.env.MONGO_URI || "mongodb://127.0.0.1:27017/studyflow";

    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);

    if (process.env.NODE_ENV === "production") {
      console.error("Fatal: Database connection failed in production.");
      process.exit(1);
    }

    console.log("⚠️ MongoDB unavailable. Offline mock database activated.");
    patchModelsForOfflineMode();
  }
};

function patchModelsForOfflineMode() {
  global.useMockDatabase = true;

  global.mockDatabase = {
    users: [],
    courses: [],
    tasks: [],
    studyblocks: [],
    quizzes: [],
    productivitylogs: [],
  };

  const defaultValues = {
    User: {
      level: 1,
      totalXP: 0,
      currentStreak: 0,
      onboardingCompleted: false,
      peakHours: ["morning", "afternoon"],
      preferredStudySessionLength: 25,
      dailyStudyGoalHours: 2,
    },
    Course: {
      color: "#6366f1",
      code: "GEN",
    },
    Task: {
      priority: "medium",
      difficulty: "medium",
      status: "todo",
      subtasks: [],
    },
    StudyBlock: {
      status: "scheduled",
      isBreak: false,
    },
    Quiz: {
      attempts: [],
      questions: [],
    },
    ProductivityLog: {
      studyTimeMinutes: 0,
      burnoutScore: 0,
    },
  };

  const modelNames = [
    "User",
    "Course",
    "Task",
    "StudyBlock",
    "Quiz",
    "ProductivityLog",
  ];

  const makeSingleChain = (value) => ({
    select: () => makeSingleChain(value),
    populate: () => makeSingleChain(value),
    lean: () => makeSingleChain(value),
    then: (cb) => Promise.resolve(value).then(cb),
    catch: (cb) => Promise.resolve(value).catch(cb),
  });

  const makeArrayChain = (value) => ({
    populate: (field) => makeArrayChain(populateRelations(value, field)),
    sort: () => makeArrayChain(value),
    lean: () => makeArrayChain(value),
    then: (cb) => Promise.resolve(value).then(cb),
    catch: (cb) => Promise.resolve(value).catch(cb),
  });

  modelNames.forEach((name) => {
    const model = mongoose.models[name];
    if (!model) return;

    const storeKey = name.toLowerCase() + "s";

    const toDoc = (obj) => {
      if (!obj) return null;

      const doc = { ...obj };

      doc._id = doc._id || new mongoose.Types.ObjectId();
      doc.id = doc._id.toString();

      doc.save = async function () {
        const cleanObj = { ...this };

        delete cleanObj.save;
        delete cleanObj.comparePassword;
        delete cleanObj.isModified;
        delete cleanObj.isDirectModified;

        const index = global.mockDatabase[storeKey].findIndex(
          (item) => item._id.toString() === cleanObj._id.toString()
        );

        if (index !== -1) {
          global.mockDatabase[storeKey][index] = {
            ...global.mockDatabase[storeKey][index],
            ...cleanObj,
            updatedAt: new Date(),
          };
        } else {
          global.mockDatabase[storeKey].push(cleanObj);
        }

        return toDoc(cleanObj);
      };

      doc.isModified = () => true;
      doc.isDirectModified = () => true;

      Object.keys(doc).forEach((key) => {
        if (Array.isArray(doc[key])) {
          doc[key].id = function (subId) {
            if (!subId) return null;

            return doc[key].find(
              (item) =>
                (item._id &&
                  item._id.toString() === subId.toString()) ||
                (item.id && item.id.toString() === subId.toString())
            );
          };
        }
      });

      if (name === "User") {
        doc.comparePassword = async function (password) {
          const bcrypt = require("bcryptjs");
          return await bcrypt.compare(password, this.password);
        };
      }

      return doc;
    };

    model.findOne = function (query = {}) {
      const found = global.mockDatabase[storeKey].find((item) =>
        matchQuery(item, query)
      );

      return makeSingleChain(toDoc(found));
    };

    model.findById = function (id) {
      if (!id) return makeSingleChain(null);

      const found = global.mockDatabase[storeKey].find(
        (item) => item._id.toString() === id.toString()
      );

      return makeSingleChain(toDoc(found));
    };

    model.find = function (query = {}) {
      const matched = global.mockDatabase[storeKey]
        .filter((item) => matchQuery(item, query))
        .map(toDoc);

      return makeArrayChain(populateRelations(matched));
    };

    model.create = async function (data) {
      const bcrypt = require("bcryptjs");
      const input = Array.isArray(data) ? data : [data];
      const created = [];

      for (const item of input) {
        const docObj = {
          ...defaultValues[name],
          ...item,
          _id: item._id || new mongoose.Types.ObjectId(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        if (name === "User" && docObj.password) {
          const salt = await bcrypt.genSalt(10);
          docObj.password = await bcrypt.hash(docObj.password, salt);
        }

        global.mockDatabase[storeKey].push(docObj);
        created.push(toDoc(docObj));
      }

      return Array.isArray(data) ? created : created[0];
    };

    model.insertMany = async function (data) {
      const result = await model.create(data);
      return Array.isArray(result) ? result : [result];
    };

    model.findOneAndDelete = async function (query = {}) {
      const index = global.mockDatabase[storeKey].findIndex((item) =>
        matchQuery(item, query)
      );

      if (index === -1) return null;

      const deleted = global.mockDatabase[storeKey].splice(index, 1)[0];
      return toDoc(deleted);
    };

    model.findByIdAndDelete = async function (id) {
      if (!id) return null;

      const index = global.mockDatabase[storeKey].findIndex(
        (item) => item._id.toString() === id.toString()
      );

      if (index === -1) return null;

      const deleted = global.mockDatabase[storeKey].splice(index, 1)[0];
      return toDoc(deleted);
    };

    model.findByIdAndUpdate = async function (id, update = {}, options = {}) {
      if (!id) return null;

      const index = global.mockDatabase[storeKey].findIndex(
        (item) => item._id.toString() === id.toString()
      );

      if (index === -1) return null;

      const current = global.mockDatabase[storeKey][index];
      const patchData = update.$set || update;

      const updated = {
        ...current,
        ...patchData,
        updatedAt: new Date(),
      };

      global.mockDatabase[storeKey][index] = updated;

      return toDoc(updated);
    };

    model.updateMany = async function (query = {}, update = {}) {
      let matchedCount = 0;

      global.mockDatabase[storeKey].forEach((item, index) => {
        if (matchQuery(item, query)) {
          matchedCount++;

          if (update.$unset) {
            Object.keys(update.$unset).forEach((key) => {
              delete global.mockDatabase[storeKey][index][key];
            });
          } else {
            const patchData = update.$set || update;

            global.mockDatabase[storeKey][index] = {
              ...item,
              ...patchData,
              updatedAt: new Date(),
            };
          }
        }
      });

      return {
        acknowledged: true,
        matchedCount,
        modifiedCount: matchedCount,
      };
    };

    model.deleteMany = async function (query = {}) {
      let deletedCount = 0;

      for (let i = global.mockDatabase[storeKey].length - 1; i >= 0; i--) {
        if (matchQuery(global.mockDatabase[storeKey][i], query)) {
          global.mockDatabase[storeKey].splice(i, 1);
          deletedCount++;
        }
      }

      return {
        acknowledged: true,
        deletedCount,
      };
    };

    model.countDocuments = async function (query = {}) {
      return global.mockDatabase[storeKey].filter((item) =>
        matchQuery(item, query)
      ).length;
    };
  });
}

function populateRelations(docs) {
  if (!Array.isArray(docs)) return docs;

  return docs.map((doc) => {
    if (doc && doc.course) {
      const courseId = doc.course.toString();

      const course = global.mockDatabase.courses.find(
        (item) => item._id.toString() === courseId
      );

      if (course) {
        doc.course = course;
      }
    }

    return doc;
  });
}

function matchQuery(item, query = {}) {
  if (!query || Object.keys(query).length === 0) return true;

  for (const key in query) {
    const queryValue = query[key];

    if (
      queryValue &&
      typeof queryValue === "object" &&
      (queryValue.$gte || queryValue.$lt || queryValue.$lte || queryValue.$gt)
    ) {
      continue;
    }

    if (key === "_id" && item._id && queryValue) {
      if (item._id.toString() !== queryValue.toString()) return false;
      continue;
    }

    if (key === "user" && item.user && queryValue) {
      if (item.user.toString() !== queryValue.toString()) return false;
      continue;
    }

    if (item[key] !== queryValue) return false;
  }

  return true;
}

module.exports = connectDB;
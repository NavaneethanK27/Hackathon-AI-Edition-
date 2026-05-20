const mongoose = require('mongoose');

// Compile and register all models onto Mongoose's internal registry
// so they can be dynamically patched on connection failures.
require('../models/User');
require('../models/Course');
require('../models/Task');
require('../models/StudyBlock');
require('../models/Quiz');
require('../models/ProductivityLog');

const connectDB = async () => {
  // Set bufferCommands to false to prevent Mongoose from hanging indefinitely on connection errors.
  mongoose.set('bufferCommands', false);

  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/studyflow';
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 2000 // Quick timeout to activate sandbox mode instantly
    });
    console.log(`MongoDB Connected successfully to Host: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    
    if (process.env.NODE_ENV === 'production') {
      console.error('Fatal: Cannot operate without active database in production.');
      process.exit(1);
    }

    console.log('\n=============================================================');
    console.log('⚠️  DATABASE UNAVAILABLE LOCAL MOUNT DETECTED!             ');
    console.log('🚀 STUDYFLOW AI: ACTIVATING OFFLINE MOCK SANDBOX DATABASE    ');
    console.log('✨ Accounts, courses, and schedules will run in-memory.     ');
    console.log('=============================================================\n');

    patchModelsForOfflineMode();
  }
};

/**
 * Dynamically intercepts standard Mongoose model methods to run an active 
 * in-memory mockup database when MongoDB is offline.
 */
function patchModelsForOfflineMode() {
  global.useMockDatabase = true;
  
  // Storage structure matching Mongoose tables
  global.mockDatabase = {
    users: [],
    courses: [],
    tasks: [],
    studyblocks: [],
    quizzes: [],
    productivitylogs: []
  };

  const defaultValues = {
    User: {
      level: 1,
      totalXP: 0,
      currentStreak: 0,
      onboardingCompleted: false,
      peakHours: ['morning', 'afternoon'],
      preferredStudySessionLength: 25,
      dailyStudyGoalHours: 2
    },
    Course: {
      color: '#6366f1',
      code: 'GEN'
    },
    Task: {
      priority: 'medium',
      difficulty: 'medium',
      status: 'todo',
      subtasks: []
    },
    StudyBlock: {
      status: 'scheduled',
      isBreak: false
    },
    Quiz: {
      attempts: [],
      questions: []
    },
    ProductivityLog: {
      studyTimeMinutes: 0,
      burnoutScore: 0
    }
  };

  const modelNames = ['User', 'Course', 'Task', 'StudyBlock', 'Quiz', 'ProductivityLog'];

  modelNames.forEach(name => {
    const model = mongoose.models[name];
    if (!model) return;

    const storeKey = name.toLowerCase() + 's';

    // Helper: Wraps single documents in a chainable thenable mimicking Mongoose Queries
    const makeSingleChain = (val) => {
      const chain = {
        select: () => makeSingleChain(val),
        populate: () => makeSingleChain(val),
        lean: () => makeSingleChain(val),
        then: (cb) => Promise.resolve(val).then(cb),
        catch: (cb) => Promise.resolve(val).catch(cb)
      };
      return chain;
    };

    // Helper: Converts plain javascript objects into document objects mimicking Mongoose behavior
    const toDoc = (obj) => {
      if (!obj) return null;
      const doc = { ...obj };
      doc._id = doc._id || new mongoose.Types.ObjectId();
      doc.id = doc._id.toString();
      
      // Mongoose save action simulation
      doc.save = async function() {
        const cleanObj = { ...this };
        delete cleanObj.save;
        delete cleanObj.comparePassword;
        delete cleanObj.isModified;
        delete cleanObj.isDirectModified;
        
        const idx = global.mockDatabase[storeKey].findIndex(x => x._id.toString() === doc._id.toString());
        if (idx !== -1) {
          global.mockDatabase[storeKey][idx] = { ...global.mockDatabase[storeKey][idx], ...cleanObj };
        } else {
          global.mockDatabase[storeKey].push(cleanObj);
        }
        return toDoc(cleanObj);
      };

      // Mongoose helper methods used in controllers
      doc.isModified = () => true;
      doc.isDirectModified = () => true;

      // Subdocuments array mock helper (e.g., doc.subtasks.id(subtaskId))
      for (let key in doc) {
        if (Array.isArray(doc[key])) {
          doc[key].id = function(subId) {
            if (!subId) return null;
            return doc[key].find(item => item._id && item._id.toString() === subId.toString() || item.id && item.id.toString() === subId.toString());
          };
        }
      }

      // Mongoose User authentication check simulation
      if (name === 'User') {
        doc.comparePassword = async function(pass) {
          const bcrypt = require('bcryptjs');
          return await bcrypt.compare(pass, this.password);
        };
      }
      return doc;
    };

    // Override Mongoose findOne
    model.findOne = function(query) {
      const items = global.mockDatabase[storeKey];
      const found = items.find(item => matchQuery(item, query));
      const doc = toDoc(found);
      return makeSingleChain(doc);
    };

    // Override Mongoose findById
    model.findById = function(id) {
      if (!id) return makeSingleChain(null);
      const items = global.mockDatabase[storeKey];
      const found = items.find(item => item._id.toString() === id.toString());
      const doc = toDoc(found);
      return makeSingleChain(doc);
    };

    // Override Mongoose find (supports populating Mongoose structures)
    model.find = function(query) {
      const matched = global.mockDatabase[storeKey].filter(item => matchQuery(item, query));
      let docs = matched.map(toDoc);

      // Perform course relation lookup populate simulation!
      docs = populateRelations(docs);

      const makeChain = (val) => {
        const chainObj = {
          populate: (field) => {
            const populated = populateRelations(val, field);
            return makeChain(populated);
          },
          sort: () => makeChain(val),
          lean: () => makeChain(val),
          then: (cb) => Promise.resolve(val).then(cb),
          catch: (cb) => Promise.resolve(val).catch(cb)
        };
        return chainObj;
      };

      const chain = makeChain(docs);
      
      // Also place chain methods directly on array for direct index usage
      docs.populate = (field) => makeChain(populateRelations(docs, field));
      docs.sort = () => makeChain(docs);
      docs.lean = () => makeChain(docs);

      return docs;
    };

    // Override Mongoose create
    model.create = async function(data) {
      const bcrypt = require('bcryptjs');
      const input = Array.isArray(data) ? data : [data];
      const created = [];

      for (let item of input) {
        const docObj = {
          ...defaultValues[name],
          ...item,
          _id: item._id || new mongoose.Types.ObjectId(),
          createdAt: new Date(),
          updatedAt: new Date()
        };

        if (name === 'User' && docObj.password) {
          // Crypt user credentials
          const salt = await bcrypt.genSalt(10);
          docObj.password = await bcrypt.hash(docObj.password, salt);
        }

        global.mockDatabase[storeKey].push(docObj);
        created.push(toDoc(docObj));
      }

      return Array.isArray(data) ? created : created[0];
    };

    // Override Mongoose insertMany
    model.insertMany = async function(data) {
      const res = await model.create(data);
      return Array.isArray(res) ? res : [res];
    };

    // Override Mongoose findOneAndDelete
    model.findOneAndDelete = async function(query) {
      const items = global.mockDatabase[storeKey];
      const idx = items.findIndex(item => matchQuery(item, query));
      if (idx !== -1) {
        const deleted = items.splice(idx, 1)[0];
        return toDoc(deleted);
      }
      return null;
    };

    // Override Mongoose findByIdAndDelete
    model.findByIdAndDelete = async function(id) {
      if (!id) return null;
      const items = global.mockDatabase[storeKey];
      const idx = items.findIndex(item => item._id.toString() === id.toString());
      if (idx !== -1) {
        const deleted = items.splice(idx, 1)[0];
        return toDoc(deleted);
      }
      return null;
    };

    // Override Mongoose findByIdAndUpdate
    model.findByIdAndUpdate = async function(id, update, options) {
      if (!id) return null;
      const items = global.mockDatabase[storeKey];
      const idx = items.findIndex(item => item._id.toString() === id.toString());
      if (idx !== -1) {
        const current = items[idx];
        const patchData = update.$set || update;
        const updated = { ...current, ...patchData, updatedAt: new Date() };
        items[idx] = updated;
        return toDoc(updated);
      }
      return null;
    };

    // Override Mongoose updateMany
    model.updateMany = async function(query, update) {
      const items = global.mockDatabase[storeKey];
      const patchData = update.$set || update.$unset || update;
      let matchedCount = 0;
      
      items.forEach((item, idx) => {
        if (matchQuery(item, query)) {
          matchedCount++;
          if (update.$unset) {
            for (let k in update.$unset) {
              delete items[idx][k];
            }
          } else {
            items[idx] = { ...item, ...patchData, updatedAt: new Date() };
          }
        }
      });
      return { acknowledged: true, matchedCount, modifiedCount: matchedCount };
    };

    // Override Mongoose deleteMany
    model.deleteMany = async function(query) {
      const items = global.mockDatabase[storeKey];
      let deletedCount = 0;
      for (let i = items.length - 1; i >= 0; i--) {
        if (matchQuery(items[i], query)) {
          items.splice(i, 1);
          deletedCount++;
        }
      }
      return { acknowledged: true, deletedCount };
    };

    // Override Mongoose countDocuments
    model.countDocuments = async function(query) {
      const items = global.mockDatabase[storeKey];
      return items.filter(item => matchQuery(item, query)).length;
    };
  });

  // Patch mongoose.Model.prototype.save globally to support doc = new ProductivityLog(...)
  mongoose.Model.prototype.save = async function() {
    if (!global.useMockDatabase) return this;
    
    const doc = this;
    const modelName = doc.constructor.modelName;
    if (!modelName) return doc;
    
    const storeKey = modelName.toLowerCase() + 's';
    if (!global.mockDatabase[storeKey]) {
      global.mockDatabase[storeKey] = [];
    }
    
    const cleanObj = doc.toObject ? doc.toObject() : { ...doc };
    cleanObj._id = cleanObj._id || doc._id || new mongoose.Types.ObjectId();
    
    const idx = global.mockDatabase[storeKey].findIndex(x => x._id.toString() === cleanObj._id.toString());
    if (idx !== -1) {
      global.mockDatabase[storeKey][idx] = { ...global.mockDatabase[storeKey][idx], ...cleanObj };
    } else {
      global.mockDatabase[storeKey].push(cleanObj);
    }
    
    // Copy updated properties back
    Object.assign(doc, cleanObj);
    return doc;
  };
}

/**
 * Handles simulated populated lookups on relational entities
 */
function populateRelations(docs, field) {
  docs.forEach(doc => {
    // Populate course references in blocks, tasks or quizzes
    if (doc.course) {
      const courseId = doc.course.toString();
      const match = global.mockDatabase.courses.find(c => c._id.toString() === courseId);
      if (match) {
        doc.course = match;
      }
    }
  });
  return docs;
}

/**
 * Evaluates in-memory schema constraints matching controller queries
 */
function matchQuery(item, query) {
  if (!query || Object.keys(query).length === 0) return true;
  for (let key in query) {
    let queryVal = query[key];
    
    // Ignore time/range bounds in queries
    if (queryVal && typeof queryVal === 'object' && (queryVal.hasOwnProperty('$gte') || queryVal.hasOwnProperty('$lt'))) {
      continue;
    }

    if (key === '_id' && item._id && queryVal) {
      if (item._id.toString() !== queryVal.toString()) return false;
      continue;
    }

    if (key === 'user' && item.user && queryVal) {
      if (item.user.toString() !== queryVal.toString()) return false;
      continue;
    }

    if (item[key] !== queryVal) return false;
  }
  return true;
}

module.exports = connectDB;

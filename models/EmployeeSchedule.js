import { getDbConnection } from '../config/database.js';
import moment from 'moment';

class EmployeeSchedule {
  // Get all employee schedules
  static async findAll() {
    return new Promise((resolve, reject) => {
      const db = getDbConnection();
      db.all(
        `SELECT es.*, u.name as employee_name, u.email as employee_email
         FROM employee_schedules es
         JOIN users u ON es.user_id = u.id
         ORDER BY es.day_of_week, es.start_time`,
        (err, schedules) => {
          if (err) return reject(err);
          resolve(schedules);
        }
      );
    });
  }

  // Get employee schedules by user id
  static async findByUserId(userId) {
    return new Promise((resolve, reject) => {
      const db = getDbConnection();
      db.all(
        `SELECT * FROM employee_schedules
         WHERE user_id = ?
         ORDER BY day_of_week, start_time`,
        [userId],
        (err, schedules) => {
          if (err) return reject(err);
          resolve(schedules);
        }
      );
    });
  }

  // Get employee schedules by day of week
  static async findByDayOfWeek(dayOfWeek) {
    return new Promise((resolve, reject) => {
      const db = getDbConnection();
      db.all(
        `SELECT es.*, u.name as employee_name, u.email as employee_email
         FROM employee_schedules es
         JOIN users u ON es.user_id = u.id
         WHERE es.day_of_week = ?
         ORDER BY es.start_time`,
        [dayOfWeek],
        (err, schedules) => {
          if (err) return reject(err);
          resolve(schedules);
        }
      );
    });
  }

  // Create a new schedule
  static async create(scheduleData) {
    return new Promise((resolve, reject) => {
      try {
        const db = getDbConnection();
        const { user_id, day_of_week, start_time, end_time } = scheduleData;
        
        // Validate day of week
        const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        if (!validDays.includes(day_of_week)) {
          return reject(new Error('Invalid day of week'));
        }
        
        // Validate times are in HH:MM format
        const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(start_time) || !timeRegex.test(end_time)) {
          return reject(new Error('Times must be in HH:MM format'));
        }
        
        // Validate start time is before end time
        const startMoment = moment(start_time, 'HH:mm');
        const endMoment = moment(end_time, 'HH:mm');
        if (!startMoment.isBefore(endMoment)) {
          return reject(new Error('Start time must be before end time'));
        }
        
        db.run(
          'INSERT INTO employee_schedules (user_id, day_of_week, start_time, end_time) VALUES (?, ?, ?, ?)',
          [user_id, day_of_week, start_time, end_time],
          function(err) {
            if (err) return reject(err);
            
            // Get the newly created schedule
            db.get('SELECT * FROM employee_schedules WHERE id = ?', [this.lastID], (err, schedule) => {
              if (err) return reject(err);
              resolve(schedule);
            });
          }
        );
      } catch (err) {
        reject(err);
      }
    });
  }

  // Update a schedule
  static async update(id, scheduleData) {
    return new Promise((resolve, reject) => {
      try {
        const db = getDbConnection();
        const { day_of_week, start_time, end_time } = scheduleData;
        
        // Validate day of week
        const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        if (!validDays.includes(day_of_week)) {
          return reject(new Error('Invalid day of week'));
        }
        
        // Validate times are in HH:MM format
        const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(start_time) || !timeRegex.test(end_time)) {
          return reject(new Error('Times must be in HH:MM format'));
        }
        
        // Validate start time is before end time
        const startMoment = moment(start_time, 'HH:mm');
        const endMoment = moment(end_time, 'HH:mm');
        if (!startMoment.isBefore(endMoment)) {
          return reject(new Error('Start time must be before end time'));
        }
        
        db.run(
          'UPDATE employee_schedules SET day_of_week = ?, start_time = ?, end_time = ? WHERE id = ?',
          [day_of_week, start_time, end_time, id],
          function(err) {
            if (err) return reject(err);
            
            if (this.changes === 0) {
              return reject(new Error('Schedule not found'));
            }
            
            // Get the updated schedule
            db.get('SELECT * FROM employee_schedules WHERE id = ?', [id], (err, schedule) => {
              if (err) return reject(err);
              resolve(schedule);
            });
          }
        );
      } catch (err) {
        reject(err);
      }
    });
  }

  // Delete a schedule
  static async delete(id) {
    return new Promise((resolve, reject) => {
      const db = getDbConnection();
      db.run('DELETE FROM employee_schedules WHERE id = ?', [id], function(err) {
        if (err) return reject(err);
        
        if (this.changes === 0) {
          return reject(new Error('Schedule not found'));
        }
        
        resolve({ success: true });
      });
    });
  }

  // Get current week's schedule for an employee
  static async getCurrentWeekSchedule(userId) {
    return new Promise((resolve, reject) => {
      try {
        const db = getDbConnection();
        db.all(
          `SELECT * FROM employee_schedules
           WHERE user_id = ?
           ORDER BY 
             CASE day_of_week
               WHEN 'Monday' THEN 1
               WHEN 'Tuesday' THEN 2
               WHEN 'Wednesday' THEN 3
               WHEN 'Thursday' THEN 4
               WHEN 'Friday' THEN 5
               WHEN 'Saturday' THEN 6
               WHEN 'Sunday' THEN 7
             END,
             start_time`,
          [userId],
          (err, schedules) => {
            if (err) return reject(err);
            
            // Format schedules for easier frontend display
            const formattedSchedules = schedules.map(schedule => {
              return {
                ...schedule,
                formatted_time: `${schedule.start_time} - ${schedule.end_time}`
              };
            });
            
            resolve(formattedSchedules);
          }
        );
      } catch (err) {
        reject(err);
      }
    });
  }
}

export default EmployeeSchedule; 
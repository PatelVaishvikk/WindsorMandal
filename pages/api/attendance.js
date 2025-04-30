// pages/api/attendance.js
import connectDb from '../../lib/db';
import Attendance from '../../models/Attendance';

export default async function handler(req, res) {
  await connectDb();
  const { method } = req;

  // Helper function to create date range for Eastern Time Zone
  const createDateRange = (dateStr) => {
    // Parse the date string
    const [year, month, day] = dateStr.split('-').map(num => parseInt(num, 10));
    
    // Create start and end dates for the exact day in UTC
    const startDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
    const endDate = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));
    
    return { start: startDate, end: endDate };
  };

  // Helper function to format date for response
  const formatDateForResponse = (date) => {
    if (!date) return null;
    // Return the date in YYYY-MM-DD format
    return date.toISOString().split('T')[0];
  };

  switch (method) {
    case 'GET': {
      try {
        const { assemblyDate, studentId, page, limit, startDate, endDate } = req.query;
        const filter = {};
        
        if (assemblyDate) {
          const { start, end } = createDateRange(assemblyDate);
          filter.assemblyDate = { $gte: start, $lte: end };
        } else if (startDate && endDate) {
          const startRange = createDateRange(startDate);
          const endRange = createDateRange(endDate);
          filter.assemblyDate = { $gte: startRange.start, $lte: endRange.end };
        }
        
        if (studentId) {
          filter.student = studentId;
        }
        
        const pageNum = parseInt(page || '1', 10);
        const limitNum = parseInt(limit || '10', 10);
        const total = await Attendance.countDocuments(filter);
        
        const attendances = await Attendance.find(filter)
          .populate('student')
          .sort({ assemblyDate: -1 })
          .skip((pageNum - 1) * limitNum)
          .limit(limitNum === 0 ? undefined : limitNum)
          .lean();

        // Format dates in the response, adjusting for Eastern Time
        const formattedAttendances = attendances.map(att => ({
          ...att,
          assemblyDate: formatDateForResponse(new Date(att.assemblyDate))
        }));

        res.status(200).json({ 
          attendances: formattedAttendances, 
          total, 
          page: pageNum 
        });
      } catch (err) {
        console.error('Error fetching attendance records:', err);
        res.status(500).json({ error: 'Failed to fetch attendance records' });
      }
      break;
    }
    
    case 'POST': {
      try {
        // Handle bulk attendance updates
        if (req.body.updates && Array.isArray(req.body.updates)) {
          const bulkOps = req.body.updates.map(update => {
            const { start } = createDateRange(update.assemblyDate);
            return {
              updateOne: {
                filter: {
                  student: update.student,
                  assemblyDate: start
                },
                update: { $set: { attended: update.attended } },
                upsert: true
              }
            };
          });
          
          const result = await Attendance.bulkWrite(bulkOps);
          return res.status(200).json({ success: true, result });
        }
        
        // Handle single attendance creation
        const { student, assemblyDate, attended } = req.body;
        if (!student || !assemblyDate) {
          return res.status(400).json({ error: 'Missing required fields' });
        }
        
        const { start } = createDateRange(assemblyDate);
        const newAttendance = new Attendance({
          student,
          assemblyDate: start,
          attended: attended === true
        });
        
        await newAttendance.save();
        res.status(201).json({ attendance: newAttendance });
      } catch (err) {
        console.error('Error creating attendance record:', err);
        res.status(500).json({ error: 'Failed to create attendance record' });
      }
      break;
    }
    
    case 'PUT': {
      const { id } = req.query;
      if (!id) {
        return res.status(400).json({ error: 'Missing attendance record id' });
      }
      
      try {
        const updateFields = { ...req.body };
        if (updateFields.assemblyDate) {
          const { start } = createDateRange(updateFields.assemblyDate);
          updateFields.assemblyDate = start;
        }
        
        const updated = await Attendance.findByIdAndUpdate(
          id, 
          updateFields, 
          { new: true }
        );
        
        if (!updated) {
          return res.status(404).json({ error: 'Attendance record not found' });
        }
        
        res.status(200).json({ attendance: updated });
      } catch (err) {
        console.error('Error updating attendance record:', err);
        res.status(500).json({ error: 'Failed to update attendance record' });
      }
      break;
    }
    
    case 'DELETE': {
      try {
        const { id, studentId, date } = req.query;
        
        // Delete single record by ID
        if (id) {
          const deleted = await Attendance.findByIdAndDelete(id);
          if (!deleted) {
            return res.status(404).json({ error: 'Attendance record not found' });
          }
          return res.status(200).json({ message: 'Attendance record deleted successfully' });
        }
        
        // Delete all records for a specific student on a specific date
        if (studentId && date) {
          const { start, end } = createDateRange(date);
          const result = await Attendance.deleteMany({
            student: studentId,
            assemblyDate: { $gte: start, $lte: end }
          });
          
          return res.status(200).json({
            message: `Deleted ${result.deletedCount} attendance records`,
            deletedCount: result.deletedCount
          });
        }
        
        // Delete all records for a specific date
        if (date) {
          const { start, end } = createDateRange(date);
          const result = await Attendance.deleteMany({
            assemblyDate: { $gte: start, $lte: end }
          });
          
          return res.status(200).json({
            message: `Deleted ${result.deletedCount} attendance records for date`,
            deletedCount: result.deletedCount
          });
        }
        
        // Delete all attendance records (use with caution)
        if (Object.keys(req.query).length === 0) {
          const result = await Attendance.deleteMany({});
          return res.status(200).json({
            message: `Deleted all ${result.deletedCount} attendance records`,
            deletedCount: result.deletedCount
          });
        }
        
        return res.status(400).json({ error: 'Missing parameters for deletion' });
      } catch (err) {
        console.error('Error deleting attendance records:', err);
        res.status(500).json({ error: 'Failed to delete attendance records' });
      }
      break;
    }
    
    default: {
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      res.status(405).json({ error: `Method ${method} not allowed` });
    }
  }
}
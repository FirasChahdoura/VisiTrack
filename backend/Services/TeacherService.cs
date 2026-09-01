using Backend.Data;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services
{
    public class TeacherService
    {
        private readonly VisiTrackDbContext _db;

        public TeacherService(VisiTrackDbContext db)
        {
            _db = db;
        }

        public async Task<List<Teacher>> GetPending()
        {
            return await _db.Teachers
                .Where(t => t.Status == TeacherStatus.Pending)
                .ToListAsync();
        }

        public async Task<Teacher> SetStatus(int teacherId, TeacherStatus newStatus)
        {
            var teacher = await _db.Teachers.FindAsync(teacherId);
            if (teacher == null)
                throw new InvalidOperationException("Teacher not found.");

            teacher.Status = newStatus;
            await _db.SaveChangesAsync();
            return teacher;
        }
    }
}
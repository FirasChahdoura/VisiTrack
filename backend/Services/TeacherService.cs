using Backend.Data;
using Backend.Models;
using Microsoft.EntityFrameworkCore;
using Backend.Dtos;

namespace Backend.Services
{
    public class TeacherService
    {
        private readonly VisiTrackDbContext _db;

        public TeacherService(VisiTrackDbContext db)
        {
            _db = db;
        }

        public async Task<Teacher> GetOwnProfile(int teacherId)
        {
            var teacher = await _db.Teachers
                .Include(t => t.ScheduleEntries)
                .Include(t => t.Inspections)
                .FirstOrDefaultAsync(t => t.Id == teacherId);

            if (teacher == null) throw new InvalidOperationException("Teacher not found.");
            return teacher;
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

        public async Task<Teacher> UpdatePersonalInfo(int teacherId, UpdatePersonalInfoDto dto)
        {
            var teacher = await _db.Teachers.FindAsync(teacherId);
            if (teacher == null) throw new InvalidOperationException("Teacher not found.");

            bool schoolExists = await _db.Schools.AnyAsync(s => s.Id == dto.SchoolId);
            if (!schoolExists) throw new InvalidOperationException("Invalid school selected.");

            teacher.FirstName = dto.FirstName;
            teacher.LastName = dto.LastName;
            teacher.DateOfBirth = dto.DateOfBirth;
            teacher.Diploma = dto.Diploma;
            teacher.SchoolId = dto.SchoolId;

            if (dto.Rank != null && Enum.TryParse<Rank>(dto.Rank, true, out var parsedRank))
            {
                teacher.Rank = parsedRank;
                // Non-titularisé ranks never have a nomination date, regardless of what was submitted
                teacher.NominationDate = parsedRank.IsTitularise() ? dto.NominationDate : null;
            }

            await _db.SaveChangesAsync();
            return teacher;
        }

        public async Task<ScheduleEntry> AddScheduleEntry(int teacherId, ScheduleEntryDto dto)
        {
            if (!Enum.TryParse<Day>(dto.Day, true, out var parsedDay))
                throw new InvalidOperationException("Invalid day.");

            var entry = new ScheduleEntry
            {
                TeacherId = teacherId,
                Day = parsedDay,
                StartTime = TimeSpan.Parse(dto.StartTime),
                EndTime = TimeSpan.Parse(dto.EndTime)
            };

            _db.ScheduleEntries.Add(entry);
            await _db.SaveChangesAsync();
            return entry;
        }

        public async Task DeleteScheduleEntry(int teacherId, int entryId)
        {
            var entry = await _db.ScheduleEntries.FindAsync(entryId);
            if (entry == null || entry.TeacherId != teacherId)
                throw new InvalidOperationException("Schedule entry not found.");

            _db.ScheduleEntries.Remove(entry);
            await _db.SaveChangesAsync();
        }

        public async Task<Inspection> AddInspection(int teacherId, InspectionDto dto)
        {
            var inspection = new Inspection { TeacherId = teacherId, Date = dto.Date };
            _db.Inspections.Add(inspection);
            await _db.SaveChangesAsync();
            return inspection;
        }

        public async Task DeleteInspection(int teacherId, int inspectionId)
        {
            var inspection = await _db.Inspections.FindAsync(inspectionId);
            if (inspection == null || inspection.TeacherId != teacherId)
                throw new InvalidOperationException("Inspection not found.");

            _db.Inspections.Remove(inspection);
            await _db.SaveChangesAsync();
        }
    }
}
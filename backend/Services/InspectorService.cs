using Backend.Data;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services
{
    public class InspectorService
    {
        private readonly VisiTrackDbContext _db;

        public InspectorService(VisiTrackDbContext db)
        {
            _db = db;
        }

        public async Task<List<Teacher>> SearchTeachers(
            string? name, string? day, string? fromTime, string? toTime,
            string? rank, int? notInspectedInMonths)
        {
            var query = _db.Teachers
                .Include(t => t.ScheduleEntries)
                .Include(t => t.Inspections)
                .Where(t => t.Status == TeacherStatus.Approved)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(name))
                query = query.Where(t =>
                    t.FirstName.Contains(name) || t.LastName.Contains(name));

            if (!string.IsNullOrWhiteSpace(rank) && Enum.TryParse<Rank>(rank, true, out var parsedRank))
                query = query.Where(t => t.Rank == parsedRank);

            Day? parsedDayNullable = null;
            if (!string.IsNullOrWhiteSpace(day) && Enum.TryParse<Day>(day, true, out var parsedDay))
            {
                parsedDayNullable = parsedDay;
                query = query.Where(t => t.ScheduleEntries.Any(s => s.Day == parsedDay));
            }

            if (notInspectedInMonths.HasValue)
            {
                var cutoff = DateTime.UtcNow.AddMonths(-notInspectedInMonths.Value);
                query = query.Where(t =>
                    !t.Inspections.Any() ||
                    t.Inspections.Max(i => i.Date) < cutoff);
            }

            var results = await query.ToListAsync();

            // Time-overlap check happens in memory, after fetching — SQLite can't translate this comparison directly
            if (parsedDayNullable.HasValue && !string.IsNullOrWhiteSpace(fromTime) && !string.IsNullOrWhiteSpace(toTime))
            {
                var from = TimeSpan.Parse(fromTime);
                var to = TimeSpan.Parse(toTime);
                results = results.Where(t => t.ScheduleEntries.Any(s =>
                    s.Day == parsedDayNullable.Value && s.StartTime < to && s.EndTime > from)).ToList();
            }

            return results;
        }

        public async Task<Teacher?> GetTeacherById(int id)
        {
            return await _db.Teachers
                .Include(t => t.School)
                .Include(t => t.ScheduleEntries)
                .Include(t => t.Inspections)
                .FirstOrDefaultAsync(t => t.Id == id);
        }
    }
}
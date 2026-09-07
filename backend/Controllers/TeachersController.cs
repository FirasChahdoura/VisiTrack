using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Inspector")]
    public class TeachersController : ControllerBase
    {
        private readonly TeacherService _teacherService;
        private readonly InspectorService _inspectorService;

        public TeachersController(TeacherService teacherService, InspectorService inspectorService)
        {
            _teacherService = teacherService;
            _inspectorService = inspectorService;
        }

        [HttpGet("pending")]
        public async Task<IActionResult> GetPending()
        {
            var pending = await _teacherService.GetPending();
            return Ok(pending.Select(t => new { t.Id, t.FirstName, t.LastName, t.Email, t.SchoolId }));
        }

        [HttpPut("{id}/approve")]
        public async Task<IActionResult> Approve(int id)
        {
            var teacher = await _teacherService.SetStatus(id, TeacherStatus.Approved);
            return Ok(new { teacher.Id, teacher.Status });
        }

        [HttpPut("{id}/reject")]
        public async Task<IActionResult> Reject(int id)
        {
            var teacher = await _teacherService.SetStatus(id, TeacherStatus.Rejected);
            return Ok(new { teacher.Id, teacher.Status });
        }

        [HttpGet("search")]
        public async Task<IActionResult> Search(
            string? name, string? day, string? fromTime, string? toTime,
            string? rank, int? notInspectedInMonths)
        {
            var results = await _inspectorService.SearchTeachers(name, day, fromTime, toTime, rank, notInspectedInMonths);
            var shaped = results.Select(t => new
            {
                t.Id, t.FirstName, t.LastName, t.Email, t.Rank,
                Schedule = t.ScheduleEntries.Select(s => new { s.Day, s.StartTime, s.EndTime }),
                LastInspectionDate = t.Inspections
                    .OrderByDescending(i => i.Date)
                    .Select(i => (DateTime?)i.Date)
                    .FirstOrDefault()
            }).ToList();

            return Ok(new { count = shaped.Count, results = shaped });
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var teacher = await _inspectorService.GetTeacherById(id);
            if (teacher == null) return NotFound();

            return Ok(new
            {
                teacher.Id, teacher.FirstName, teacher.LastName, teacher.Email, teacher.Rank,
                School = teacher.School.Name,
                Schedule = teacher.ScheduleEntries.Select(s => new { s.Day, s.StartTime, s.EndTime }),
                Inspections = teacher.Inspections
                    .OrderByDescending(i => i.Date)
                    .Select(i => new { i.Id, i.Date })
            });
        }
    }
}
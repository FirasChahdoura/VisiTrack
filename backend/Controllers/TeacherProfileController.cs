using System.Security.Claims;
using Backend.Dtos;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/teachers/me")]
    [Authorize(Roles = "Teacher")]
    public class TeacherProfileController : ControllerBase
    {
        private readonly TeacherService _teacherService;

        public TeacherProfileController(TeacherService teacherService)
        {
            _teacherService = teacherService;
        }

        private int GetTeacherId() =>
            int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        [HttpGet]
        public async Task<IActionResult> GetProfile()
        {
            var teacher = await _teacherService.GetOwnProfile(GetTeacherId());
            return Ok(new
            {
                teacher.Id, teacher.FirstName, teacher.LastName, teacher.Email,
                teacher.DateOfBirth, teacher.NominationDate, teacher.Rank, teacher.Diploma, teacher.SchoolId,
                Schedule = teacher.ScheduleEntries.Select(s => new { s.Id, s.Day, s.StartTime, s.EndTime }),
                Inspections = teacher.Inspections.OrderByDescending(i => i.Date).Select(i => new { i.Id, i.Date })
            });
        }

        [HttpPut]
        public async Task<IActionResult> UpdatePersonalInfo(UpdatePersonalInfoDto dto)
        {
            try
            {
                var teacher = await _teacherService.UpdatePersonalInfo(GetTeacherId(), dto);
                return Ok(new { teacher.Id, teacher.FirstName, teacher.LastName, teacher.DateOfBirth, teacher.NominationDate, teacher.Rank, teacher.Diploma, teacher.SchoolId });
            }
            catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
        }

        [HttpPost("schedule")]
        public async Task<IActionResult> AddSchedule(ScheduleEntryDto dto)
        {
            try
            {
                var entry = await _teacherService.AddScheduleEntry(GetTeacherId(), dto);
                return Ok(new { entry.Id, entry.Day, entry.StartTime, entry.EndTime });
            }
            catch (Exception ex) { return BadRequest(new { message = ex.Message }); }
        }

        [HttpDelete("schedule/{id}")]
        public async Task<IActionResult> DeleteSchedule(int id)
        {
            try
            {
                await _teacherService.DeleteScheduleEntry(GetTeacherId(), id);
                return NoContent();
            }
            catch (InvalidOperationException ex) { return NotFound(new { message = ex.Message }); }
        }

        [HttpPost("inspections")]
        public async Task<IActionResult> AddInspection(InspectionDto dto)
        {
            var inspection = await _teacherService.AddInspection(GetTeacherId(), dto);
            return Ok(new { inspection.Id, inspection.Date });
        }

        [HttpDelete("inspections/{id}")]
        public async Task<IActionResult> DeleteInspection(int id)
        {
            try
            {
                await _teacherService.DeleteInspection(GetTeacherId(), id);
                return NoContent();
            }
            catch (InvalidOperationException ex) { return NotFound(new { message = ex.Message }); }
        }
    }
}
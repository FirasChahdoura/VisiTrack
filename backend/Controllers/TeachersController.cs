using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TeachersController : ControllerBase
    {
        private readonly TeacherService _teacherService;

        public TeachersController(TeacherService teacherService)
        {
            _teacherService = teacherService;
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
    }
}
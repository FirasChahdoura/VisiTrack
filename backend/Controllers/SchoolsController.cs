using Backend.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SchoolsController : ControllerBase
    {
        private readonly VisiTrackDbContext _db;

        public SchoolsController(VisiTrackDbContext db)
        {
            _db = db;
        }

        [HttpGet]
        public async Task<IActionResult> GetSchools()
        {
            var schools = await _db.Schools
                .Select(s => new { s.Id, s.Name })
                .ToListAsync();

            return Ok(schools);
        }
    }
}
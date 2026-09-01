using Backend.Data;
using Backend.Dtos;
using Backend.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Backend.Services
{
    public class AuthService
    {
        private readonly VisiTrackDbContext _db;
        private readonly IConfiguration _config;

        public AuthService(VisiTrackDbContext db, IConfiguration config)
        {
            _db = db;
            _config = config;
        }

        public async Task<Teacher> Register(RegisterRequestDto dto)
        {
            bool emailExists = await _db.Teachers.AnyAsync(t => t.Email == dto.Email);
            if (emailExists)
            {
                throw new InvalidOperationException("Email already registered.");
            }

            var teacher = new Teacher
            {
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                Email = dto.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                SchoolId = dto.SchoolId,
                Status = TeacherStatus.Pending
            };

            _db.Teachers.Add(teacher);
            await _db.SaveChangesAsync();

            return teacher;
        }

        public async Task<string> Login(LoginRequestDto dto)
        {
            // Check Teacher first
            var teacher = await _db.Teachers.FirstOrDefaultAsync(t => t.Email == dto.Email);
            if (teacher != null)
            {
                if (!BCrypt.Net.BCrypt.Verify(dto.Password, teacher.PasswordHash))
                    throw new InvalidOperationException("Invalid email or password.");

                if (teacher.Status != TeacherStatus.Approved)
                    throw new InvalidOperationException($"Account status: {teacher.Status}. Awaiting approval.");

                return GenerateToken(teacher.Id.ToString(), "Teacher");
            }

            // Check Inspector
            var inspector = await _db.Inspectors.FirstOrDefaultAsync(i => i.Email == dto.Email);
            if (inspector != null)
            {
                if (!BCrypt.Net.BCrypt.Verify(dto.Password, inspector.PasswordHash))
                    throw new InvalidOperationException("Invalid email or password.");

                return GenerateToken(inspector.Id.ToString(), "Inspector");
            }

            throw new InvalidOperationException("Invalid email or password.");
        }

        private string GenerateToken(string userId, string role)
        {
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, userId),
                new Claim(ClaimTypes.Role, role)
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(double.Parse(_config["Jwt:ExpiryMinutes"]!)),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
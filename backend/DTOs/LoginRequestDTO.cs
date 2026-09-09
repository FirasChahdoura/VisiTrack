using System.ComponentModel.DataAnnotations;

namespace Backend.Dtos
{
    public class LoginRequestDto
    {
        [Required, EmailAddress]
        public required string Email { get; set; }

        [Required]
        public required string Password { get; set; }
    }
}

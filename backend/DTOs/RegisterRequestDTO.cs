using System.ComponentModel.DataAnnotations;

namespace Backend.Dtos
{
    public class RegisterRequestDto
    {
        [Required, MaxLength(100)]
        public required string FirstName { get; set; }

        [Required, MaxLength(100)]
        public required string LastName { get; set; }

        [Required, EmailAddress]
        public required string Email { get; set; }

        [Required, MinLength(8)]
        public required string Password { get; set; }

        [Required]
        public required int SchoolId { get; set; }
    }
}

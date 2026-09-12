using System.ComponentModel.DataAnnotations;

namespace Backend.Dtos
{
    public class UpdatePersonalInfoDto
    {
        [Required, MaxLength(100)]
        public required string FirstName { get; set; }

        [Required, MaxLength(100)]
        public required string LastName { get; set; }

        public DateTime? DateOfBirth { get; set; }
        public DateTime? NominationDate { get; set; }
        public string? Rank { get; set; }
        public string? Diploma { get; set; }

        [Required]
        public required int SchoolId { get; set; }
    }
}

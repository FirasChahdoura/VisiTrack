namespace Backend.Dtos
{
    public class UpdatePersonalInfoDto
    {
        public required string FirstName { get; set; }
        public required string LastName { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public DateTime? NominationDate { get; set; }
        public string? Rank { get; set; }
    }
}
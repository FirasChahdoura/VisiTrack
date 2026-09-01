namespace Backend.Dtos
{
    public class RegisterRequestDto
    {
        public required string FirstName { get; set; }
        public required string LastName { get; set; }
        public required string Email { get; set; }
        public required string Password { get; set; }
        public required int SchoolId { get; set; } // scool id or school? 
    }
}
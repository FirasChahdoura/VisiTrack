namespace Backend.Models
{
    public class Inspector
    {
        public int Id { get; set; }
        public required string Email { get; set; }
        public required string PasswordHash { get; set; }
    }
}
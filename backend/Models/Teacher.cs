namespace Backend.Models
{
    public class Teacher
    {
        public int Id { get; set; }

        // Required at registration
        public required string FirstName { get; set; }
        public required string LastName { get; set; }
        public required string Email { get; set; }
        public required string PasswordHash { get; set; }
        public int SchoolId { get; set; }
        public School School { get; set; } = null!;
        public TeacherStatus Status { get; set; } = TeacherStatus.Pending;

        // Only filled in after approval — nullable until then
        public DateTime? DateOfBirth { get; set; }
        public DateTime? NominationDate { get; set; }
        public Rank? Rank { get; set; }

        public ICollection<Inspection> Inspections { get; set; } = new List<Inspection>();
        public ICollection<ScheduleEntry> ScheduleEntries { get; set; } = new List<ScheduleEntry>();
    }
}
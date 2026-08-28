namespace Backend.Models
{
    public class ScheduleEntry
    {
        public int Id { get; set; }
        public Day Day { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }

        public int TeacherId { get; set; }
        public Teacher Teacher { get; set; } = null!;
    }
}
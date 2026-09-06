namespace Backend.Dtos
{
    public class ScheduleEntryDto
    {
        public required string Day { get; set; }
        public required string StartTime { get; set; }
        public required string EndTime { get; set; }
    }
}
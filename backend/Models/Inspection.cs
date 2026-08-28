namespace Backend.Models
{
    public class Inspection
    {
        public int Id { get; set; }
        public DateTime Date { get; set; }

        public int TeacherId { get; set; }
        public Teacher Teacher { get; set; } = null!;
    }
}
namespace Backend.Models
{
    public class School
    {
        public int Id { get; set; }
        public required string Name { get; set; }

        public ICollection<Teacher> Teachers { get; set; } = new List<Teacher>();
    }
}
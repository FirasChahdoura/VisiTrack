using Microsoft.EntityFrameworkCore;
using Backend.Models;

namespace Backend.Data
{
    public class VisiTrackDbContext : DbContext
    {
        public VisiTrackDbContext(DbContextOptions<VisiTrackDbContext> options) : base(options) { }

        public DbSet<Teacher> Teachers { get; set; }
        public DbSet<School> Schools { get; set; }
        public DbSet<Inspection> Inspections { get; set; }
        public DbSet<ScheduleEntry> ScheduleEntries { get; set; }
        public DbSet<Inspector> Inspectors { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Teacher>()
                .HasMany(t => t.Inspections)
                .WithOne(i => i.Teacher)
                .HasForeignKey(i => i.TeacherId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Teacher>()
                .HasMany(t => t.ScheduleEntries)
                .WithOne(s => s.Teacher)
                .HasForeignKey(s => s.TeacherId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Teacher>()
                .HasOne(t => t.School)
                .WithMany(s => s.Teachers)
                .HasForeignKey(t => t.SchoolId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Teacher>().HasIndex(t => t.Email).IsUnique();
            modelBuilder.Entity<Inspector>().HasIndex(i => i.Email).IsUnique();
        }
    }
}
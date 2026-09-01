using Backend.Data;
using Backend.Models;
using Backend.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();
builder.Services.AddControllers();

builder.Services.AddDbContext<VisiTrackDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<TeacherService>();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<VisiTrackDbContext>();
    if (!db.Schools.Any())
    {
        db.Schools.AddRange(
            new School { Name = "School A (placeholder)" },
            new School { Name = "School B (placeholder)" }
        );
        db.SaveChanges();
    }

    if (!db.Inspectors.Any())
    {
        db.Inspectors.Add(new Inspector
        {
            Email = "inspector@visitrack.local",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("InspectorPass123")
        });
        db.SaveChanges();
    }
}

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.MapControllers();

app.Run();
using Backend.Data;
using Backend.Models;
using Backend.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Security.Claims;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();
builder.Services.AddControllers(); // register the routing system

builder.Services.AddDbContext<VisiTrackDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<TeacherService>();

var jwtKey = builder.Configuration["Jwt:Key"]!;
var jwtIssuer = builder.Configuration["Jwt:Issuer"];

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = jwtIssuer,
            ValidateAudience = false,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
            RoleClaimType = ClaimTypes.Role
        };
    });

builder.Services.AddAuthorization();

builder.Services.AddScoped<InspectorService>();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<VisiTrackDbContext>();
    if (!db.Schools.Any())
    {
        string[] schoolNames = {
            "El-Folla", "Essaha", "El Machtel 1", "El Machtel 2",
            "Ksar Saïd 1", "Ksar Saïd 2", "Ksar Saïd 3",
            "Jayara 1", "Jayara 2", "El Attar", "Antit",
            "Okba 1", "Okba 2", "Ghdir El Golla", "El Waha", "Borj Chakir"
        };
        db.Schools.AddRange(schoolNames.Select(name => new School { Name = name }));
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

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
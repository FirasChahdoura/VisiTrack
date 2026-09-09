using Backend.Data;
using Backend.Models;
using Backend.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Security.Claims;
using System.Threading.RateLimiting;

var builder = WebApplication.CreateBuilder(args);
builder.Configuration.AddUserSecrets<Program>();

builder.Services.AddOpenApi();
builder.Services.AddControllers(); // register the routing system

if (builder.Environment.IsDevelopment())
{
    builder.Services.AddDbContext<VisiTrackDbContext>(options =>
        options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));
}
else
{
    builder.Services.AddDbContext<VisiTrackDbContext>(options =>
        options.UseNpgsql(builder.Configuration.GetConnectionString("ProductionConnection")));
}

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

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddRateLimiter(options =>
{
    options.AddPolicy("LoginPolicy", httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 5,
                Window = TimeSpan.FromMinutes(1),
                QueueLimit = 0
            }));
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<VisiTrackDbContext>();

    if (app.Environment.IsDevelopment())
    {
        db.Database.Migrate();
    }
    else
    {
        db.Database.EnsureCreated();
    }

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
        var inspectorEmail = builder.Configuration["InspectorSeed:Email"];
        var inspectorPassword = builder.Configuration["InspectorSeed:Password"];

        if (!string.IsNullOrWhiteSpace(inspectorEmail) && !string.IsNullOrWhiteSpace(inspectorPassword))
        {
            db.Inspectors.Add(new Inspector
            {
                Email = inspectorEmail,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(inspectorPassword)
            });
            db.SaveChanges();
        }
    }
}

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();
app.UseRateLimiter();

app.MapControllers();

app.Run();
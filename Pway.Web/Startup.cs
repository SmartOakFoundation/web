
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.SpaServices.Webpack;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Pway.Data;
using Pway.Web.Models;
using Pway.Web.Services;
using System;
using AutoMapper;
using Hangfire;
using System.Linq.Expressions;
using Hangfire.Common;
using Pway.Common.Options;
using Newtonsoft.Json;
using NLog.Web;
using Microsoft.Extensions.Logging;
using NLog.Extensions.Logging;
using Microsoft.AspNetCore.Http;
using System.Linq;
using Pway.Web.Controllers;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.DataProtection.AuthenticatedEncryption.ConfigurationModel;
using Microsoft.AspNetCore.DataProtection.AuthenticatedEncryption;

namespace Pway.Web
{
    public partial class Startup
    {
        public Startup(IConfiguration configuration, IServiceProvider provider)
        {
            Configuration = configuration;
            ServiceProvider = provider;
        }

        public IConfiguration Configuration { get; }
        public static IServiceProvider ServiceProvider { get; set; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            var connectionString = String.Format(Configuration.GetConnectionString("PwayDB"));
            var jwtAppSettingOptions = Configuration.GetSection(nameof(JwtIssuerOptions));

            services.AddDbContext<ApplicationDbContext>(options =>
            {
                options.UseSqlServer(connectionString, b => b.MigrationsAssembly("Pway.Web"));
            });

            AddSecurity(services);

            services.AddCors(options =>
            {
                options.AddPolicy("AllowAllOrigins",
                    builder =>
                    {
                        builder
                            .AllowAnyOrigin()
                            .AllowAnyHeader()
                            .AllowAnyMethod();
                    });
            });

            services.AddDistributedMemoryCache();
            services.AddSession();
            services.AddAutoMapper();
            services.AddSignalR();

            services.AddDataProtection()
               .UseCryptographicAlgorithms(new AuthenticatedEncryptorConfiguration()
               {
                   EncryptionAlgorithm = EncryptionAlgorithm.AES_256_GCM,
                   ValidationAlgorithm = ValidationAlgorithm.HMACSHA256
               });

            services.AddHangfire(x => x.UseSqlServerStorage(connectionString));

            services.Configure<EthereumOptions>(Configuration.GetSection("Ethereum"));

            services.AddTransient<EmailSender, EmailSender>();
            services.AddSingleton<NameRegistryContractService, NameRegistryContractService>();
            services.AddSingleton<PwayTokenContractService, PwayTokenContractService>();
            services.AddSingleton<SignatureVerifierService, SignatureVerifierService>();
            services.AddSingleton<PwayGamesStoreContractService, PwayGamesStoreContractService>();

            services.AddTransient<ClaimsService, ClaimsService>();
            services.AddTransient<EthereumService, EthereumService>();

            services.AddHostedService<GamesPurchaseeUpdater>();

            services.AddMvc();
            ServiceProvider = services.BuildServiceProvider();



        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {
            //fucking net 2.1
            AppContext.SetSwitch("System.Net.Http.UseSocketsHttpHandler", false);

            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                app.UseWebpackDevMiddleware(new WebpackDevMiddlewareOptions
                {
                    ConfigFile = "config/webpack.dev.js",
                    HotModuleReplacement = true
                });
            }
            else
            {
                app.UseExceptionHandler("/Home/Error");
            }

            var angularRoutes = new[] {
                 "/games"
             };


            app.Use(async (context, next) =>
            {
                if (context.Request.Path.HasValue && null != angularRoutes.FirstOrDefault(
                    (ar) => context.Request.Path.Value.StartsWith(ar, StringComparison.OrdinalIgnoreCase)))
                {
                    context.Request.Path = new PathString("/");
                }

                await next();
            });

            app.UseCors("AllowAllOrigins");
            app.UseSignalR(routes =>
            {
                routes.MapHub<NotifyHub>("/notify");
            });

            app.UseHangfireServer();
            app.UseHangfireDashboard();

            app.UseAuthentication();
            app.UseDefaultFiles();
            app.UseStaticFiles();
            app.UseSession();

            app.UseMiddleware(typeof(ErrorWrappingMiddleware));
            app.UseMvc();

            var minutes = Int32.Parse(Configuration["CronMinutes"]);
            var rangeUpdateMinutes = Int32.Parse(Configuration["Ethereum:RangeUpdateTimeMinutes"]);
        }
    }
}

using AutoMapper;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace SmartOak.Web.Services
{
    public class ClaimsService
    {
        private readonly IHttpContextAccessor _httpAccessor;
        private readonly IConfiguration _configuration;
        private readonly IMapper _mapper;

        public ClaimsService(
            IHttpContextAccessor httpAccessor,
            IMapper mapper,
            IConfiguration configuration)
        {
            this._httpAccessor = httpAccessor;
            this._configuration = configuration;
            this._mapper = mapper;
        }
        

        private void AddToUpdateHeader(IEnumerable<Claim> claims)
        {
            var tokenString = CreateToken(claims);
            if (_httpAccessor.HttpContext.Response.Headers.ContainsKey(_configuration["updateTokenHeader"]))
                _httpAccessor.HttpContext.Response.Headers[_configuration["updateTokenHeader"]] = tokenString;
            else
                _httpAccessor.HttpContext.Response.Headers.Add(_configuration["updateTokenHeader"], tokenString);
        }


        public string CreateToken(IEnumerable<Claim> claims)
        {
            claims = claims.Where(x => x.Type != JwtRegisteredClaimNames.Aud).ToList();

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Tokens:Key"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(_configuration["Tokens:Issuer"],
              _configuration["Tokens:Issuer"],
              claims,
              expires: DateTime.Now.AddDays(Double.Parse(_configuration["Tokens:JwtExpiresDays"])),
              signingCredentials: creds);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

    }
}

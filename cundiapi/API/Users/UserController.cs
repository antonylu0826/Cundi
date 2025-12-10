using CundiApi.BusinessObjects;
using DevExpress.ExpressApp;
using DevExpress.ExpressApp.Core;
using DevExpress.ExpressApp.Security;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CundiApi.API.Users;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UserController : ControllerBase
{
    private readonly IObjectSpaceFactory _objectSpaceFactory;

    public UserController(IObjectSpaceFactory objectSpaceFactory)
    {
        _objectSpaceFactory = objectSpaceFactory;
    }

    [HttpPost("ResetPassword")]
    public IActionResult ResetPassword([FromBody] ResetPasswordDto dto)
    {
        if (string.IsNullOrEmpty(dto.NewPassword))
        {
            return BadRequest("Password cannot be empty.");
        }

        using IObjectSpace objectSpace = _objectSpaceFactory.CreateObjectSpace<ApplicationUser>();
        var user = objectSpace.GetObjectByKey<ApplicationUser>(dto.UserId);

        if (user == null)
        {
            return NotFound("User not found.");
        }

        user.SetPassword(dto.NewPassword);
        objectSpace.CommitChanges();

        return Ok("Password reset successfully.");
    }
}

public class ResetPasswordDto
{
    public Guid UserId { get; set; }
    public string NewPassword { get; set; }
}

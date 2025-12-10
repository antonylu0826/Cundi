using CundiApi.BusinessObjects;
using DevExpress.ExpressApp;
using DevExpress.ExpressApp.Core;
using DevExpress.ExpressApp.Security;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;

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

    [HttpPost("UpdateUserRoles")]
    public IActionResult UpdateUserRoles([FromBody] UpdateUserRolesDto dto)
    {
        using IObjectSpace objectSpace = _objectSpaceFactory.CreateObjectSpace<ApplicationUser>();
        var user = objectSpace.GetObjectByKey<ApplicationUser>(dto.UserId);

        if (user == null)
        {
            return NotFound("User not found.");
        }

        // Fetch all roles to map Oids to objects
        var rolesToAssign = objectSpace.GetObjectsQuery<DevExpress.Persistent.BaseImpl.PermissionPolicy.PermissionPolicyRole>()
            .Where(r => dto.RoleIds.Contains(r.Oid))
            .ToList();

        // 1. Remove roles not in the new list
        var currentRoles = user.Roles.ToList();
        foreach (var role in currentRoles)
        {
            if (!dto.RoleIds.Contains(role.Oid))
            {
                user.Roles.Remove(role);
            }
        }

        // 2. Add new roles
        foreach (var role in rolesToAssign)
        {
            if (!user.Roles.Any(r => r.Oid == role.Oid))
            {
                user.Roles.Add(role);
            }
        }

        objectSpace.CommitChanges();

        return Ok("Roles updated successfully.");
    }
}

public class ResetPasswordDto
{
    public Guid UserId { get; set; }
    public string NewPassword { get; set; }
}

public class UpdateUserRolesDto
{
    public Guid UserId { get; set; }
    public List<Guid> RoleIds { get; set; }
}

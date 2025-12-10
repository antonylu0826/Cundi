using CundiApi.DTOs;
using DevExpress.ExpressApp;
using DevExpress.Persistent.BaseImpl.PermissionPolicy;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CundiApi.API.Roles;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class RoleController : ControllerBase
{
    private readonly IObjectSpaceFactory _objectSpaceFactory;

    public RoleController(IObjectSpaceFactory objectSpaceFactory)
    {
        _objectSpaceFactory = objectSpaceFactory;
    }

    [HttpPost("UpdateRole")]
    public IActionResult UpdateRole([FromBody] RoleUpdateDto dto)
    {
        using IObjectSpace objectSpace = _objectSpaceFactory.CreateObjectSpace<PermissionPolicyRole>();

        var role = objectSpace.GetObjectByKey<PermissionPolicyRole>(dto.Oid);

        if (role == null)
        {
            return NotFound("Role not found.");
        }

        // Update simple properties
        role.Name = dto.Name;
        role.IsAdministrative = dto.IsAdministrative;
        role.PermissionPolicy = dto.PermissionPolicy;

        // Reconcile TypePermissions
        // 1. Identify permissions to delete using optimized HashSet Lookup
        var incomingOids = dto.TypePermissions != null
            ? new HashSet<Guid>(dto.TypePermissions.Select(p => p.Oid).Where(oid => oid != Guid.Empty))
            : new HashSet<Guid>();

        var permissionsToDelete = new List<PermissionPolicyTypePermissionObject>();
        foreach (var existingPerm in role.TypePermissions)
        {
            if (!incomingOids.Contains(existingPerm.Oid))
            {
                permissionsToDelete.Add(existingPerm);
            }
        }

        foreach (var perm in permissionsToDelete)
        {
            role.TypePermissions.Remove(perm);
            perm.Delete();
        }

        // 2. Add or Update permissions
        if (dto.TypePermissions != null)
        {
            foreach (var permDto in dto.TypePermissions)
            {
                PermissionPolicyTypePermissionObject permObject = null;

                if (permDto.Oid != Guid.Empty)
                {
                    permObject = role.TypePermissions.FirstOrDefault(p => p.Oid == permDto.Oid);
                }

                if (permObject == null)
                {
                    permObject = objectSpace.CreateObject<PermissionPolicyTypePermissionObject>();
                    role.TypePermissions.Add(permObject);
                }

                // Fix TargetType assignment
                var typeInfo = XafTypesInfo.Instance.FindTypeInfo(permDto.TargetType);
                if (typeInfo != null)
                {
                    permObject.TargetType = typeInfo.Type;
                }

                permObject.ReadState = permDto.ReadState;
                permObject.WriteState = permDto.WriteState;
                permObject.CreateState = permDto.CreateState;
                permObject.DeleteState = permDto.DeleteState;
                permObject.NavigateState = permDto.NavigateState;
            }
        }

        objectSpace.CommitChanges();

        return Ok(new { Oid = role.Oid });
    }
}
